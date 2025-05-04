// src/main/java/com/taskflow/api/repository/CommentRepository.java

package com.taskflow.api.repository;

import com.taskflow.api.model.Card;
import com.taskflow.api.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByCardOrderByCreatedAtDesc(Card card);
}