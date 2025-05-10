

package com.taskflow.api.controller;

import com.taskflow.api.dto.CommentDTO;
import com.taskflow.api.dto.CreateCommentRequest;
import com.taskflow.api.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByCard(
            @PathVariable Long cardId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(commentService.getCommentsByCard(cardId, email));
    }

    @PostMapping
    public ResponseEntity<CommentDTO> createComment(
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(commentService.createComment(request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        commentService.deleteComment(id, email);
        return ResponseEntity.noContent().build();
    }
}