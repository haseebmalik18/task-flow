package com.taskflow.api.repository;

import com.taskflow.api.model.User;
import com.taskflow.api.model.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    VerificationToken findByToken(String token);
    Optional<VerificationToken> findByUser(User user);
}