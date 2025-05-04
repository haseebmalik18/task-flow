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
        } else {

            shiftCardsForInsert(list, request.getPosition());
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

        BoardList currentList = getListAndVerifyAccess(card.getList().getId(), email);


        Integer oldPosition = card.getPosition();
        Long oldListId = card.getList().getId();


        card.setTitle(request.getTitle());
        if (request.getDescription() != null) {
            card.setDescription(request.getDescription());
        }
        if (request.getDueDate() != null) {
            card.setDueDate(request.getDueDate());
        }


        if (request.getListId() != null && !request.getListId().equals(oldListId)) {

            BoardList newList = getListAndVerifyAccess(request.getListId(), email);

            if (request.getPosition() != null) {

                shiftCardsForInsert(newList, request.getPosition());
                card.setPosition(request.getPosition());
            } else {

                List<Card> cardsInNewList = cardRepository.findByListOrderByPositionAsc(newList);
                card.setPosition(cardsInNewList.size());
            }


            shiftCardsAfterRemoval(currentList, oldPosition);


            card.setList(newList);
        } else if (request.getPosition() != null && !request.getPosition().equals(oldPosition)) {

            handlePositionChange(currentList, oldPosition, request.getPosition());
            card.setPosition(request.getPosition());
        }

        Card updatedCard = cardRepository.save(card);
        return CardDTO.fromCard(updatedCard);
    }

    @Transactional
    public void deleteCard(Long cardId, String email) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        BoardList list = getListAndVerifyAccess(card.getList().getId(), email);


        Integer position = card.getPosition();


        cardRepository.delete(card);


        shiftCardsAfterRemoval(list, position);
    }



    private void shiftCardsForInsert(BoardList list, Integer newPosition) {
        List<Card> cardsToShift = cardRepository.findByListOrderByPositionAsc(list)
                .stream()
                .filter(card -> card.getPosition() >= newPosition)
                .collect(Collectors.toList());

        for (Card cardToShift : cardsToShift) {
            cardToShift.setPosition(cardToShift.getPosition() + 1);
            cardRepository.save(cardToShift);
        }
    }

    private void shiftCardsAfterRemoval(BoardList list, Integer position) {
        List<Card> cardsToShift = cardRepository.findByListOrderByPositionAsc(list)
                .stream()
                .filter(card -> card.getPosition() > position)
                .collect(Collectors.toList());

        for (Card card : cardsToShift) {
            card.setPosition(card.getPosition() - 1);
            cardRepository.save(card);
        }
    }

    private void handlePositionChange(BoardList list, Integer oldPosition, Integer newPosition) {
        if (oldPosition < newPosition) {

            List<Card> cardsToShift = cardRepository.findByListOrderByPositionAsc(list)
                    .stream()
                    .filter(card -> card.getPosition() > oldPosition && card.getPosition() <= newPosition)
                    .collect(Collectors.toList());

            for (Card cardToShift : cardsToShift) {
                cardToShift.setPosition(cardToShift.getPosition() - 1);
                cardRepository.save(cardToShift);
            }
        } else {

            List<Card> cardsToShift = cardRepository.findByListOrderByPositionAsc(list)
                    .stream()
                    .filter(card -> card.getPosition() >= newPosition && card.getPosition() < oldPosition)
                    .collect(Collectors.toList());

            for (Card cardToShift : cardsToShift) {
                cardToShift.setPosition(cardToShift.getPosition() + 1);
                cardRepository.save(cardToShift);
            }
        }
    }

    private BoardList getListAndVerifyAccess(Long listId, String email) {
        BoardList list = boardListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        boardListService.getListsByBoard(list.getBoard().getId(), email);

        return list;
    }

    // Add this method to src/main/java/com/taskflow/api/service/CardService.java

    // Inside CardService class
    public CardDTO getCardDetails(Long cardId, String email) {
        Card card = getCardAndVerifyAccess(cardId, email);
        return CardDTO.fromCardWithDetails(card);
    }

    // Also add this helper method and make it public
    public Card getCardAndVerifyAccess(Long cardId, String email) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        // Verify card's list belongs to the user
        BoardList list = card.getList();
        boardListService.getListsByBoard(list.getBoard().getId(), email);

        return card;
    }
}