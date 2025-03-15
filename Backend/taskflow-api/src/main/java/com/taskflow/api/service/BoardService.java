
package com.taskflow.api.service;

import com.taskflow.api.dto.BoardDTO;
import com.taskflow.api.dto.CreateBoardRequest;
import com.taskflow.api.model.Board;
import com.taskflow.api.model.User;
import com.taskflow.api.repository.BoardRepository;
import com.taskflow.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardService {
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    public List<BoardDTO> getBoardsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return boardRepository.findByOwnerOrderByCreatedAtDesc(user)
                .stream()
                .map(BoardDTO::fromBoard)
                .collect(Collectors.toList());
    }

    public BoardDTO createBoard(CreateBoardRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = Board.builder()
                .title(request.getTitle())
                .backgroundColor(request.getBackgroundColor())
                .workspace(request.getWorkspace() != null ? request.getWorkspace() : "Personal")
                .owner(owner)
                .build();

        Board savedBoard = boardRepository.save(board);
        return BoardDTO.fromBoard(savedBoard);
    }

    public BoardDTO getBoard(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        if (!board.getOwner().equals(user)) {
            throw new RuntimeException("You do not have access to this board");
        }

        return BoardDTO.fromBoard(board);
    }

    public BoardDTO updateBoard(Long id, CreateBoardRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        if (!board.getOwner().equals(user)) {
            throw new RuntimeException("You do not have access to this board");
        }

        board.setTitle(request.getTitle());
        if (request.getBackgroundColor() != null) {
            board.setBackgroundColor(request.getBackgroundColor());
        }
        if (request.getWorkspace() != null) {
            board.setWorkspace(request.getWorkspace());
        }

        Board updatedBoard = boardRepository.save(board);
        return BoardDTO.fromBoard(updatedBoard);
    }

    public void deleteBoard(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = boardRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        if (!board.getOwner().equals(user)) {
            throw new RuntimeException("You do not have access to this board");
        }

        boardRepository.delete(board);
    }
}