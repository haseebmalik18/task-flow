package com.taskflow.api.dto;

import com.taskflow.api.model.Board;
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
public class BoardDTO {
    private Long id;
    private String title;
    private String backgroundColor;
    private String workspace;
    private List<BoardListDTO> lists;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BoardDTO fromBoard(Board board) {
        return BoardDTO.builder()
                .id(board.getId())
                .title(board.getTitle())
                .backgroundColor(board.getBackgroundColor())
                .workspace(board.getWorkspace())
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }

    public static BoardDTO fromBoardWithLists(Board board) {
        return BoardDTO.builder()
                .id(board.getId())
                .title(board.getTitle())
                .backgroundColor(board.getBackgroundColor())
                .workspace(board.getWorkspace())
                .lists(board.getLists().stream()
                        .map(BoardListDTO::fromBoardList)
                        .collect(Collectors.toList()))
                .createdAt(board.getCreatedAt())
                .updatedAt(board.getUpdatedAt())
                .build();
    }
}