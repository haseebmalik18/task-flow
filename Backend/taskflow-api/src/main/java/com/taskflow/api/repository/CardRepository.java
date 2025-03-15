
package com.taskflow.api.repository;

import com.taskflow.api.model.BoardList;
import com.taskflow.api.model.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByListOrderByPositionAsc(BoardList list);
}