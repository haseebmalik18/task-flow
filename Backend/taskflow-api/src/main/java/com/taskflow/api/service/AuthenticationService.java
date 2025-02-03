package com.taskflow.api.service;

import com.taskflow.api.dto.auth.AuthenticationRequest;
import com.taskflow.api.dto.auth.AuthenticationResponse;
import com.taskflow.api.dto.auth.RegisterRequest;
import com.taskflow.api.exception.EmailNotVerifiedException;
import com.taskflow.api.exception.InvalidCredentialsException;
import com.taskflow.api.model.Role;
import com.taskflow.api.model.User;
import com.taskflow.api.model.VerificationToken;
import com.taskflow.api.repository.UserRepository;
import com.taskflow.api.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository userRepository;
    private final VerificationTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    public AuthenticationResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }


        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .enabled(false)
                .build();
        userRepository.save(user);


        String verificationCode = generateVerificationCode();
        VerificationToken verificationToken = new VerificationToken(user, verificationCode);
        tokenRepository.save(verificationToken);


        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        return AuthenticationResponse.builder()
                .message("Please check your email for verification code")
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        try {

            var user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));


            if (!user.isEnabled()) {
                throw new EmailNotVerifiedException("Please verify your email before logging in");
            }


            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );


            var jwtToken = jwtService.generateToken(user);

            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .build();

        } catch (AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
    }

    public String verifyEmail(String email, String code) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find verification token
        VerificationToken token = tokenRepository.findByToken(code);

        if (token == null) {
            throw new RuntimeException("Invalid verification code");
        }

        if (!token.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Invalid verification code for this email");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(token);
            throw new RuntimeException("Verification code expired");
        }

        // Enable user and save
        user.setEnabled(true);
        userRepository.save(user);

        // Delete used token
        tokenRepository.delete(token);

        return "Email verified successfully";
    }

    // In AuthenticationService.java
    public AuthenticationResponse resendVerificationCode(String email) {
        // Find user
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEnabled()) {
            throw new RuntimeException("Email already verified");
        }

        // Delete old verification tokens if any
        tokenRepository.findByUser(user)
                .ifPresent(tokenRepository::delete);

        // Generate new verification code
        String verificationCode = generateVerificationCode();
        VerificationToken verificationToken = new VerificationToken(user, verificationCode);
        tokenRepository.save(verificationToken);

        // Send new verification email
        emailService.sendVerificationEmail(user.getEmail(), verificationCode);

        return AuthenticationResponse.builder()
                .message("New verification code sent to your email")
                .build();
    }

    private String generateVerificationCode() {
        // Generate a 6-digit code
        return String.format("%06d", new Random().nextInt(999999));
    }
}