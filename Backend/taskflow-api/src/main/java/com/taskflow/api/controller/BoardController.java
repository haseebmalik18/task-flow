package com.taskflow.api.controller;

import com.taskflow.api.dto.BoardDTO;
import com.taskflow.api.dto.CreateBoardRequest;
import com.taskflow.api.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<List<BoardDTO>> getUserBoards(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardService.getBoardsByUser(email));
    }

    @PostMapping
    public ResponseEntity<BoardDTO> createBoard(
            @Valid @RequestBody CreateBoardRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardService.createBoard(request, email));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BoardDTO> getBoard(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardService.getBoard(id, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BoardDTO> updateBoard(
            @PathVariable Long id,
            @Valid @RequestBody CreateBoardRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(boardService.updateBoard(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBoard(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        boardService.deleteBoard(id, email);
        return ResponseEntity.noContent().build();
    }
}