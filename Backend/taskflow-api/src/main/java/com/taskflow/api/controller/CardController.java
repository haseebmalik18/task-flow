package com.taskflow.api.controller;

import com.taskflow.api.dto.CardDTO;
import com.taskflow.api.dto.CreateCardRequest;
import com.taskflow.api.service.CardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
@RequiredArgsConstructor
public class CardController {
    private final CardService cardService;

    @GetMapping("/list/{listId}")
    public ResponseEntity<List<CardDTO>> getCardsByList(
            @PathVariable Long listId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(cardService.getCardsByList(listId, email));
    }

    @PostMapping
    public ResponseEntity<CardDTO> createCard(
            @Valid @RequestBody CreateCardRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(cardService.createCard(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CardDTO> updateCard(
            @PathVariable Long id,
            @Valid @RequestBody CreateCardRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(cardService.updateCard(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCard(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        cardService.deleteCard(id, email);
        return ResponseEntity.noContent().build();
    }

    // Add this method to src/main/java/com/taskflow/api/controller/CardController.java

    @GetMapping("/{id}/details")
    public ResponseEntity<CardDTO> getCardDetails(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(cardService.getCardDetails(id, email));
    }
}