package com.taskflow.api.service;

import com.taskflow.api.dto.BoardListDTO;
import com.taskflow.api.dto.CreateBoardListRequest;
import com.taskflow.api.model.Board;
import com.taskflow.api.model.BoardList;
import com.taskflow.api.repository.BoardListRepository;
import com.taskflow.api.repository.BoardRepository;
import com.taskflow.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BoardListService {
    private final BoardListRepository boardListRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<BoardListDTO> getListsByBoard(Long boardId, String email) {
        Board board = getBoardAndVerifyAccess(boardId, email);

        return boardListRepository.findByBoardOrderByPositionAsc(board)
                .stream()
                .map(BoardListDTO::fromBoardList)
                .collect(Collectors.toList());
    }

    @Transactional
    public BoardListDTO createList(CreateBoardListRequest request, String email) {
        Board board = getBoardAndVerifyAccess(request.getBoardId(), email);

        if (request.getPosition() == null) {
            List<BoardList> lists = boardListRepository.findByBoardOrderByPositionAsc(board);
            request.setPosition(lists.size());
        } else {

            shiftBoardListsForInsert(board, request.getPosition());
        }

        BoardList boardList = BoardList.builder()
                .title(request.getTitle())
                .board(board)
                .position(request.getPosition())
                .build();

        BoardList savedList = boardListRepository.save(boardList);
        return BoardListDTO.fromBoardListWithoutCards(savedList);
    }

    @Transactional
    public BoardListDTO updateList(Long listId, CreateBoardListRequest request, String email) {
        BoardList boardList = boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        Board board = getBoardAndVerifyAccess(boardList.getBoard().getId(), email);


        Integer oldPosition = boardList.getPosition();


        boardList.setTitle(request.getTitle());


        if (request.getPosition() != null && !request.getPosition().equals(oldPosition)) {
            handlePositionChange(board, oldPosition, request.getPosition());
            boardList.setPosition(request.getPosition());
        }

        BoardList updatedList = boardListRepository.save(boardList);
        return BoardListDTO.fromBoardListWithoutCards(updatedList);
    }

    @Transactional
    public void deleteList(Long listId, String email) {
        BoardList boardList = boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        getBoardAndVerifyAccess(boardList.getBoard().getId(), email);


        Integer position = boardList.getPosition();
        Board board = boardList.getBoard();


        boardListRepository.delete(boardList);


        List<BoardList> listsToUpdate = boardListRepository.findByBoardOrderByPositionAsc(board)
                .stream()
                .filter(list -> list.getPosition() > position)
                .collect(Collectors.toList());

        for (BoardList list : listsToUpdate) {
            list.setPosition(list.getPosition() - 1);
            boardListRepository.save(list);
        }
    }


    private void shiftBoardListsForInsert(Board board, Integer newPosition) {
        List<BoardList> listsToShift = boardListRepository.findByBoardOrderByPositionAsc(board)
                .stream()
                .filter(list -> list.getPosition() >= newPosition)
                .collect(Collectors.toList());

        for (BoardList listToShift : listsToShift) {
            listToShift.setPosition(listToShift.getPosition() + 1);
            boardListRepository.save(listToShift);
        }
    }

    private void handlePositionChange(Board board, Integer oldPosition, Integer newPosition) {
        if (oldPosition < newPosition) {

            List<BoardList> listsToShift = boardListRepository.findByBoardOrderByPositionAsc(board)
                    .stream()
                    .filter(list -> list.getPosition() > oldPosition && list.getPosition() <= newPosition)
                    .collect(Collectors.toList());

            for (BoardList listToShift : listsToShift) {
                listToShift.setPosition(listToShift.getPosition() - 1);
                boardListRepository.save(listToShift);
            }
        } else {

            List<BoardList> listsToShift = boardListRepository.findByBoardOrderByPositionAsc(board)
                    .stream()
                    .filter(list -> list.getPosition() >= newPosition && list.getPosition() < oldPosition)
                    .collect(Collectors.toList());

            for (BoardList listToShift : listsToShift) {
                listToShift.setPosition(listToShift.getPosition() + 1);
                boardListRepository.save(listToShift);
            }
        }
    }

    private Board getBoardAndVerifyAccess(Long boardId, String email) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        if (!board.getOwner().getEmail().equals(email)) {
            throw new RuntimeException("You do not have access to this board");
        }

        return board;
    }
}