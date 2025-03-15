
package com.taskflow.api.repository;

import com.taskflow.api.model.Board;
import com.taskflow.api.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByOwner(User owner);
    List<Board> findByOwnerOrderByCreatedAtDesc(User owner);
}