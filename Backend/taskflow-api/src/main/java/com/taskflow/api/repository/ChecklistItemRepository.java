

package com.taskflow.api.repository;

import com.taskflow.api.model.Card;
import com.taskflow.api.model.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    @Query("SELECT c FROM ChecklistItem c WHERE c.card = ?1 ORDER BY c.position ASC")
    List<ChecklistItem> findByCardOrderByPositionAsc(Card card);
}