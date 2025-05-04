// src/main/java/com/taskflow/api/dto/CreateCommentRequest.java

package com.taskflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCommentRequest {
    @NotBlank(message = "Comment content is required")
    private String content;

    @NotNull(message = "Card ID is required")
    private Long cardId;
}