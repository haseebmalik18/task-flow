package com.taskflow.api.repository;

import com.taskflow.api.model.Board;
import com.taskflow.api.model.BoardList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardListRepository extends JpaRepository<BoardList, Long> {
    List<BoardList> findByBoardOrderByPositionAsc(Board board);
}