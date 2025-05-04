// src/main/java/com/taskflow/api/dto/ChecklistItemDTO.java

package com.taskflow.api.dto;

import com.taskflow.api.model.ChecklistItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChecklistItemDTO {
    private Long id;
    private String content;
    private boolean completed;
    private Integer position;
    private Long cardId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ChecklistItemDTO fromChecklistItem(ChecklistItem item) {
        return ChecklistItemDTO.builder()
                .id(item.getId())
                .content(item.getContent())
                .completed(item.isCompleted())
                .position(item.getPosition())
                .cardId(item.getCard().getId())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}