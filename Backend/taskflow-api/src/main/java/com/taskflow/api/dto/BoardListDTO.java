package com.taskflow.api.dto;

import com.taskflow.api.model.BoardList;
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
public class BoardListDTO {
    private Long id;
    private String title;
    private Long boardId;
    private Integer position;
    private List<CardDTO> cards;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BoardListDTO fromBoardList(BoardList boardList) {
        return BoardListDTO.builder()
                .id(boardList.getId())
                .title(boardList.getTitle())
                .boardId(boardList.getBoard().getId())
                .position(boardList.getPosition())
                .cards(boardList.getCards().stream()
                        .map(CardDTO::fromCard)
                        .collect(Collectors.toList()))
                .createdAt(boardList.getCreatedAt())
                .updatedAt(boardList.getUpdatedAt())
                .build();
    }

    public static BoardListDTO fromBoardListWithoutCards(BoardList boardList) {
        return BoardListDTO.builder()
                .id(boardList.getId())
                .title(boardList.getTitle())
                .boardId(boardList.getBoard().getId())
                .position(boardList.getPosition())
                .createdAt(boardList.getCreatedAt())
                .updatedAt(boardList.getUpdatedAt())
                .build();
    }
}