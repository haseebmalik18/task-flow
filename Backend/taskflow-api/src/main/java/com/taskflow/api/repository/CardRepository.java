package com.taskflow.api.repository;

import com.taskflow.api.model.BoardList;
import com.taskflow.api.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {

    @Query("SELECT c FROM Card c WHERE c.list = ?1 ORDER BY c.position ASC")
    List<Card> findByListOrderByPositionAsc(BoardList list);
}