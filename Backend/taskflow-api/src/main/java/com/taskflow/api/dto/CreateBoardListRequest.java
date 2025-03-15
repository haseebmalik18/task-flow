package com.taskflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardListRequest {
    @NotBlank(message = "List title is required")
    private String title;

    @NotNull(message = "Board ID is required")
    private Long boardId;

    private Integer position;
}