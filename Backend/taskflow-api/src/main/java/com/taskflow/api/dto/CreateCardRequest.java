package com.taskflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCardRequest {
    @NotBlank(message = "Card title is required")
    private String title;

    private String description;

    @NotNull(message = "List ID is required")
    private Long listId;

    private Integer position;

    private LocalDateTime dueDate;
}