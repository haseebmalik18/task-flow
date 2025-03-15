
package com.taskflow.api.service;

import com.taskflow.api.dto.CardDTO;
import com.taskflow.api.dto.CreateCardRequest;
import com.taskflow.api.model.BoardList;
import com.taskflow.api.model.Card;
import com.taskflow.api.repository.BoardListRepository;
import com.taskflow.api.repository.CardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {
    private final CardRepository cardRepository;
    private final BoardListRepository boardListRepository;
    private final BoardListService boardListService;

    @Transactional(readOnly = true)
    public List<CardDTO> getCardsByList(Long listId, String email) {
        BoardList list = getListAndVerifyAccess(listId, email);

        return cardRepository.findByListOrderByPositionAsc(list)
                .stream()
                .map(CardDTO::fromCard)
                .collect(Collectors.toList());
    }

    @Transactional
    public CardDTO createCard(CreateCardRequest request, String email) {
        BoardList list = getListAndVerifyAccess(request.getListId(), email);


        if (request.getPosition() == null) {
            List<Card> cards = cardRepository.findByListOrderByPositionAsc(list);
            request.setPosition(cards.size());
        }

        Card card = Card.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .list(list)
                .position(request.getPosition())
                .dueDate(request.getDueDate())
                .build();

        Card savedCard = cardRepository.save(card);
        return CardDTO.fromCard(savedCard);
    }

    @Transactional
    public CardDTO updateCard(Long cardId, CreateCardRequest request, String email) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));


        getListAndVerifyAccess(card.getList().getId(), email);

        card.setTitle(request.getTitle());

        if (request.getDescription() != null) {
            card.setDescription(request.getDescription());
        }

        if (request.getPosition() != null) {
            card.setPosition(request.getPosition());
        }

        if (request.getDueDate() != null) {
            card.setDueDate(request.getDueDate());
        }


        if (request.getListId() != null && !request.getListId().equals(card.getList().getId())) {
            BoardList newList = getListAndVerifyAccess(request.getListId(), email);
            card.setList(newList);
        }

        Card updatedCard = cardRepository.save(card);
        return CardDTO.fromCard(updatedCard);
    }

    @Transactional
    public void deleteCard(Long cardId, String email) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));


        getListAndVerifyAccess(card.getList().getId(), email);

        cardRepository.delete(card);
    }

    private BoardList getListAndVerifyAccess(Long listId, String email) {
        BoardList list = boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        boardListService.getListsByBoard(list.getBoard().getId(), email);

        return list;
    }
}