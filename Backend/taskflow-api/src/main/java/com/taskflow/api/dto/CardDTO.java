// Update src/main/java/com/taskflow/api/dto/CardDTO.java

package com.taskflow.api.dto;

import com.taskflow.api.model.Card;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardDTO {
    private Long id;
    private String title;
    private String description;
    private Long listId;
    private Integer position;
    private LocalDateTime dueDate;
    private List<CommentDTO> comments;
    private List<ChecklistItemDTO> checklistItems;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CardDTO fromCard(Card card) {
        return CardDTO.builder()
                .id(card.getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .listId(card.getList().getId())
                .position(card.getPosition())
                .dueDate(card.getDueDate())
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }

    public static CardDTO fromCardWithDetails(Card card) {
        return CardDTO.builder()
                .id(card.getId())
                .title(card.getTitle())
                .description(card.getDescription())
                .listId(card.getList().getId())
                .position(card.getPosition())
                .dueDate(card.getDueDate())
                .comments(card.getComments().stream()
                        .map(CommentDTO::fromComment)
                        .collect(Collectors.toList()))
                .checklistItems(card.getChecklistItems().stream()
                        .map(ChecklistItemDTO::fromChecklistItem)
                        .collect(Collectors.toList()))
                .createdAt(card.getCreatedAt())
                .updatedAt(card.getUpdatedAt())
                .build();
    }
}