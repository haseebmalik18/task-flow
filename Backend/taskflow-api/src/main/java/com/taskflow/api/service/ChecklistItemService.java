// src/main/java/com/taskflow/api/service/ChecklistItemService.java

package com.taskflow.api.service;

import com.taskflow.api.dto.ChecklistItemDTO;
import com.taskflow.api.dto.CreateChecklistItemRequest;
import com.taskflow.api.model.Card;
import com.taskflow.api.model.ChecklistItem;
import com.taskflow.api.repository.CardRepository;
import com.taskflow.api.repository.ChecklistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistItemService {
    private final ChecklistItemRepository checklistItemRepository;
    private final CardRepository cardRepository;
    private final CardService cardService;

    @Transactional(readOnly = true)
    public List<ChecklistItemDTO> getChecklistItemsByCard(Long cardId, String email) {
        Card card = cardService.getCardAndVerifyAccess(cardId, email);
        return checklistItemRepository.findByCardOrderByPositionAsc(card)
                .stream()
                .map(ChecklistItemDTO::fromChecklistItem)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChecklistItemDTO createChecklistItem(CreateChecklistItemRequest request, String email) {
        Card card = cardService.getCardAndVerifyAccess(request.getCardId(), email);

        if (request.getPosition() == null) {
            List<ChecklistItem> items = checklistItemRepository.findByCardOrderByPositionAsc(card);
            request.setPosition(items.size());
        } else {
            shiftChecklistItemsForInsert(card, request.getPosition());
        }

        ChecklistItem item = ChecklistItem.builder()
                .content(request.getContent())
                .completed(request.isCompleted())
                .position(request.getPosition())
                .card(card)
                .build();

        ChecklistItem savedItem = checklistItemRepository.save(item);
        return ChecklistItemDTO.fromChecklistItem(savedItem);
    }

    @Transactional
    public ChecklistItemDTO updateChecklistItem(Long itemId, CreateChecklistItemRequest request, String email) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));

        // Verify access to the card
        cardService.getCardAndVerifyAccess(item.getCard().getId(), email);

        item.setContent(request.getContent());
        item.setCompleted(request.isCompleted());

        // If position is changing
        if (request.getPosition() != null && !request.getPosition().equals(item.getPosition())) {
            handlePositionChange(item.getCard(), item.getPosition(), request.getPosition());
            item.setPosition(request.getPosition());
        }

        ChecklistItem updatedItem = checklistItemRepository.save(item);
        return ChecklistItemDTO.fromChecklistItem(updatedItem);
    }

    @Transactional
    public void deleteChecklistItem(Long itemId, String email) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));

        Card card = cardService.getCardAndVerifyAccess(item.getCard().getId(), email);

        // Get position before deleting
        Integer position = item.getPosition();

        // Delete the item
        checklistItemRepository.delete(item);

        // Update positions of remaining items
        List<ChecklistItem> itemsToUpdate = checklistItemRepository.findByCardOrderByPositionAsc(card)
                .stream()
                .filter(i -> i.getPosition() > position)
                .collect(Collectors.toList());

        itemsToUpdate.forEach(i -> {
            i.setPosition(i.getPosition() - 1);
            checklistItemRepository.save(i);
        });
    }

    private void shiftChecklistItemsForInsert(Card card, Integer newPosition) {
        List<ChecklistItem> itemsToShift = checklistItemRepository.findByCardOrderByPositionAsc(card)
                .stream()
                .filter(item -> item.getPosition() >= newPosition)
                .collect(Collectors.toList());

        itemsToShift.forEach(item -> {
            item.setPosition(item.getPosition() + 1);
            checklistItemRepository.save(item);
        });
    }

    private void handlePositionChange(Card card, Integer oldPosition, Integer newPosition) {
        if (oldPosition < newPosition) {
            // Moving item down the list
            List<ChecklistItem> itemsToShift = checklistItemRepository.findByCardOrderByPositionAsc(card)
                    .stream()
                    .filter(item -> item.getPosition() > oldPosition && item.getPosition() <= newPosition)
                    .collect(Collectors.toList());

            itemsToShift.forEach(item -> {
                item.setPosition(item.getPosition() - 1);
                checklistItemRepository.save(item);
            });
        } else {
            // Moving item up the list
            List<ChecklistItem> itemsToShift = checklistItemRepository.findByCardOrderByPositionAsc(card)
                    .stream()
                    .filter(item -> item.getPosition() >= newPosition && item.getPosition() < oldPosition)
                    .collect(Collectors.toList());

            itemsToShift.forEach(item -> {
                item.setPosition(item.getPosition() + 1);
                checklistItemRepository.save(item);
            });
        }
    }
}