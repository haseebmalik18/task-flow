package com.taskflow.api.controller;

import com.taskflow.api.dto.BoardListDTO;
import com.taskflow.api.dto.CreateBoardListRequest;
import com.taskflow.api.service.BoardListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/lists")
@RequiredArgsConstructor
public class BoardListController {
    private final BoardListService boardListService;

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<BoardListDTO>> getListsByBoard(
            @PathVariable Long boardId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardListService.getListsByBoard(boardId, email));
    }

    @PostMapping
    public ResponseEntity<BoardListDTO> createList(
            @Valid @RequestBody CreateBoardListRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardListService.createList(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardListDTO> updateList(
            @PathVariable Long id,
            @Valid @RequestBody CreateBoardListRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardListService.updateList(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteList(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        boardListService.deleteList(id, email);
        return ResponseEntity.noContent().build();
    }
}