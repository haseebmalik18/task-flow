// src/main/java/com/taskflow/api/service/CommentService.java

package com.taskflow.api.service;

import com.taskflow.api.dto.CommentDTO;
import com.taskflow.api.dto.CreateCommentRequest;
import com.taskflow.api.model.Card;
import com.taskflow.api.model.Comment;
import com.taskflow.api.model.User;
import com.taskflow.api.repository.CardRepository;
import com.taskflow.api.repository.CommentRepository;
import com.taskflow.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final CardService cardService;

    public List<CommentDTO> getCommentsByCard(Long cardId, String email) {
        Card card = cardService.getCardAndVerifyAccess(cardId, email);
        return commentRepository.findByCardOrderByCreatedAtDesc(card)
                .stream()
                .map(CommentDTO::fromComment)
                .collect(Collectors.toList());
    }

    public CommentDTO createComment(CreateCommentRequest request, String email) {
        Card card = cardService.getCardAndVerifyAccess(request.getCardId(), email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .content(request.getContent())
                .card(card)
                .author(user)
                .build();

        Comment savedComment = commentRepository.save(comment);
        return CommentDTO.fromComment(savedComment);
    }

    public void deleteComment(Long commentId, String email) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Verify access to the card
        cardService.getCardAndVerifyAccess(comment.getCard().getId(), email);

        // Check if the user is the author of the comment
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!comment.getAuthor().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this comment");
        }

        commentRepository.delete(comment);
    }
}