// src/main/java/com/taskflow/api/dto/CreateBoardRequest.java
package com.taskflow.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBoardRequest {
    @NotBlank(message = "Board title is required")
    private String title;

    private String backgroundColor;
    private String workspace;
}