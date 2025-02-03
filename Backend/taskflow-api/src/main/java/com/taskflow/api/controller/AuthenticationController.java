package com.taskflow.api.controller;

import com.taskflow.api.dto.auth.AuthenticationRequest;
import com.taskflow.api.dto.auth.AuthenticationResponse;
import com.taskflow.api.dto.auth.RegisterRequest;
import com.taskflow.api.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthenticationController {

    @Autowired
    private AuthenticationService authenticationService;

    @PostMapping("/register")
    public ResponseEntity<AuthenticationResponse> register(
            @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authenticationService.register(request));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticationResponse> authenticate(
            @RequestBody AuthenticationRequest request
    ) {
        return ResponseEntity.ok(authenticationService.authenticate(request));
    }

    @PostMapping("/verify")
    public ResponseEntity<String> verifyEmail(
            @RequestParam String email,
            @RequestParam String code) {
        return ResponseEntity.ok(authenticationService.verifyEmail(email, code));
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<AuthenticationResponse> resendVerificationCode(
            @RequestParam String email) {
        return ResponseEntity.ok(authenticationService.resendVerificationCode(email));
    }
}