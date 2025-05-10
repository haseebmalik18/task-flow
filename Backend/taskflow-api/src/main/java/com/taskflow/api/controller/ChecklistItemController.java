

package com.taskflow.api.controller;

import com.taskflow.api.dto.ChecklistItemDTO;
import com.taskflow.api.dto.CreateChecklistItemRequest;
import com.taskflow.api.service.ChecklistItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/v1/checklist-items")
@RequiredArgsConstructor
public class ChecklistItemController {
    private final ChecklistItemService checklistItemService;

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<ChecklistItemDTO>> getChecklistItemsByCard(
            @PathVariable Long cardId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(checklistItemService.getChecklistItemsByCard(cardId, email));
    }

    @PostMapping
    public ResponseEntity<ChecklistItemDTO> createChecklistItem(
            @Valid @RequestBody CreateChecklistItemRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(checklistItemService.createChecklistItem(request, email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChecklistItemDTO> updateChecklistItem(
            @PathVariable Long id,
            @Valid @RequestBody CreateChecklistItemRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(checklistItemService.updateChecklistItem(id, request, email));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChecklistItem(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String email = authentication.getName();
        checklistItemService.deleteChecklistItem(id, email);
        return ResponseEntity.noContent().build();
    }
}