import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import DashboardLayout from "../components/layout/DashboardLayout";
import { boardService } from "../components/services/api/board";
import { listService, BoardList } from "../components/services/api/list";
import { cardService } from "../components/services/api/card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CardDetailsModal from "../components/cards/CardDetailsModal";

const BoardView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<any>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newListTitle, setNewListTitle] = useState("");
  const [newCardTitles, setNewCardTitles] = useState<{ [key: number]: string }>(
    {}
  );
  const [addingList, setAddingList] = useState(false);
  const [addingCards, setAddingCards] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isCardDetailsModalOpen, setIsCardDetailsModalOpen] = useState(false);

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const boardData = await boardService.getBoard(id);
        setBoard(boardData);

        const listsData = await listService.getListsByBoard(id);
        console.log("Lists data from server:", listsData);

        const sortedLists = [...listsData].sort(
          (a, b) => a.position - b.position
        );

        sortedLists.forEach((list) => {
          if (list.cards) {
            list.cards.sort((a, b) => a.position - b.position);
          }
        });

        setLists(sortedLists);
      } catch (err) {
        console.error("Error fetching board data:", err);
        setError("Failed to load board details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [id]);

  const refreshBoardData = async () => {
    try {
      if (!id) return;

      const listsData = await listService.getListsByBoard(id);
      console.log("Refreshed lists data:", listsData);

      const sortedLists = [...listsData].sort(
        (a, b) => a.position - b.position
      );

      sortedLists.forEach((list) => {
        if (list.cards) {
          list.cards.sort((a, b) => a.position - b.position);
        }
      });

      setLists(sortedLists);
    } catch (err) {
      console.error("Error refreshing board data:", err);
    }
  };

  const handleAddList = async () => {
    if (!id || !newListTitle.trim()) return;

    try {
      const newList = await listService.createList({
        title: newListTitle,
        boardId: parseInt(id),
        position: lists.length,
      });

      setLists([...lists, newList]);
      setNewListTitle("");
      setAddingList(false);
    } catch (err) {
      console.error("Error adding list:", err);
      setError("Failed to add list");
    }
  };

  const handleAddCard = async (listId: number) => {
    const cardTitle = newCardTitles[listId];
    if (!cardTitle || !cardTitle.trim()) return;

    try {
      const listIndex = lists.findIndex((list) => list.id === listId);
      if (listIndex === -1) return;

      const newCard = await cardService.createCard({
        title: cardTitle,
        listId: listId,
        position: lists[listIndex].cards?.length || 0,
      });

      const updatedLists = [...lists];
      const updatedList = { ...updatedLists[listIndex] };
      updatedList.cards = [...(updatedList.cards || []), newCard];
      updatedLists[listIndex] = updatedList;

      setLists(updatedLists);
      setNewCardTitles({ ...newCardTitles, [listId]: "" });
      setAddingCards({ ...addingCards, [listId]: false });
    } catch (err) {
      console.error("Error adding card:", err);
      setError("Failed to add card");
    }
  };

  const handleCardClick = (card: any) => {
    setSelectedCard(card);
    setIsCardDetailsModalOpen(true);
  };

  const handleUpdateCard = async (updatedCard: any) => {
    try {
      await cardService.updateCard(updatedCard.id, {
        title: updatedCard.title,
        description: updatedCard.description,
        listId: updatedCard.listId,
        position: updatedCard.position,
        dueDate: updatedCard.dueDate,
      });

      const updatedLists = lists.map((list) => {
        if (list.id === updatedCard.listId) {
          return {
            ...list,
            cards: list.cards.map((card) =>
              card.id === updatedCard.id ? { ...card, ...updatedCard } : card
            ),
          };
        }
        return list;
      });

      setLists(updatedLists);
      setSelectedCard(updatedCard);
    } catch (err) {
      console.error("Error updating card:", err);
      setError("Failed to update card");
    }
  };

  const handleDeleteCard = async () => {
    if (!selectedCard) return;

    try {
      await cardService.deleteCard(selectedCard.id);

      const updatedLists = lists.map((list) => {
        if (list.id === selectedCard.listId) {
          return {
            ...list,
            cards: list.cards.filter((card) => card.id !== selectedCard.id),
          };
        }
        return list;
      });

      setLists(updatedLists);
      setIsCardDetailsModalOpen(false);
      setSelectedCard(null);
    } catch (err) {
      console.error("Error deleting card:", err);
      setError("Failed to delete card");
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "list") {
      const listId = parseInt(draggableId.replace("list-", ""));

      const reorderedLists = Array.from(lists);
      const [removed] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, removed);

      setLists(reorderedLists);

      try {
        const updatedList = await listService.updateList(listId, {
          title: removed.title,
          boardId: parseInt(id || "0"),
          position: destination.index,
        });

        console.log(
          `List ${listId} moved to position ${destination.index}`,
          updatedList
        );

        await refreshBoardData();
      } catch (err) {
        console.error("Error updating list position:", err);
      }

      return;
    }

    const sourceListId = parseInt(source.droppableId);
    const destinationListId = parseInt(destination.droppableId);

    const newLists = lists.map((list) => ({
      ...list,
      cards: list.cards ? [...list.cards] : [],
    }));

    const sourceList = newLists.find((list) => list.id === sourceListId);
    const destinationList = newLists.find(
      (list) => list.id === destinationListId
    );

    if (!sourceList || !destinationList) return;

    if (sourceListId === destinationListId) {
      const cardId = parseInt(draggableId.replace("card-", ""));

      const cards = Array.from(sourceList.cards || []);
      const [removed] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, removed);

      sourceList.cards = cards;
      setLists(newLists);

      try {
        await cardService.updateCard(cardId, {
          title: removed.title,
          description: removed.description,
          listId: sourceListId,
          position: destination.index,
          dueDate: removed.dueDate,
        });

        console.log(
          `Card ${cardId} moved to position ${destination.index} in list ${sourceListId}`
        );

        await refreshBoardData();
      } catch (err) {
        console.error("Error updating card position:", err);
      }
    } else {
      const cardId = parseInt(draggableId.replace("card-", ""));

      const sourceCards = Array.from(sourceList.cards || []);
      const [removed] = sourceCards.splice(source.index, 1);
      sourceList.cards = sourceCards;

      const destinationCards = Array.from(destinationList.cards || []);

      const updatedCard = { ...removed, listId: destinationListId };
      destinationCards.splice(destination.index, 0, updatedCard);
      destinationList.cards = destinationCards;

      setLists(newLists);

      try {
        await cardService.updateCard(cardId, {
          title: removed.title,
          description: removed.description,
          listId: destinationListId,
          position: destination.index,
          dueDate: removed.dueDate,
        });

        console.log(
          `Card ${cardId} moved from list ${sourceListId} to list ${destinationListId} at position ${destination.index}`
        );

        await refreshBoardData();
      } catch (err) {
        console.error("Error moving card between lists:", err);
      }
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <LoadingSpinner size="large" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
          <p>{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="mt-2 text-blue-600 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">{board?.title}</h1>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
              Share
            </button>
            <button className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200">
              Settings
            </button>
          </div>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                className="flex overflow-x-auto pb-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {lists.map((list, index) => (
                  <Draggable
                    key={`list-${list.id}`}
                    draggableId={`list-${list.id}`}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`mr-4 bg-gray-100 rounded-md w-72 flex-shrink-0 max-h-[calc(100vh-200px)] ${
                          snapshot.isDragging ? "shadow-xl" : ""
                        }`}
                      >
                        <div className="p-2">
                          <div
                            className="font-medium px-2 py-1 flex items-center"
                            {...provided.dragHandleProps}
                          >
                            <span className="mr-2">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="text-gray-400"
                              >
                                <path
                                  d="M8 6H16M8 12H16M8 18H16"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            {list.title}
                          </div>

                          <Droppable droppableId={`${list.id}`} type="card">
                            {(provided, snapshot) => (
                              <div
                                className={`mt-2 min-h-[5px] ${
                                  snapshot.isDraggingOver ? "bg-blue-50" : ""
                                }`}
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                              >
                                {list.cards &&
                                  list.cards.map((card, cardIndex) => (
                                    <Draggable
                                      key={`card-${card.id}`}
                                      draggableId={`card-${card.id}`}
                                      index={cardIndex}
                                    >
                                      {(provided, snapshot) => (
                                        <div
                                          ref={provided.innerRef}
                                          {...provided.draggableProps}
                                          {...provided.dragHandleProps}
                                          className={`bg-white p-2 rounded shadow cursor-pointer mb-2 ${
                                            snapshot.isDragging
                                              ? "shadow-lg bg-blue-50"
                                              : ""
                                          }`}
                                          onClick={() => handleCardClick(card)}
                                        >
                                          <p>{card.title}</p>
                                          {card.description && (
                                            <p className="text-gray-500 text-sm mt-1 truncate">
                                              {card.description}
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}

                                {addingCards[list.id] ? (
                                  <div className="bg-white p-2 rounded shadow">
                                    <textarea
                                      className="w-full px-2 py-1 border border-gray-300 rounded resize-none"
                                      placeholder="Enter a title for this card..."
                                      rows={2}
                                      value={newCardTitles[list.id] || ""}
                                      onChange={(e) =>
                                        setNewCardTitles({
                                          ...newCardTitles,
                                          [list.id]: e.target.value,
                                        })
                                      }
                                    />
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        className="bg-[#2563eb] text-white px-3 py-1 rounded"
                                        onClick={() => handleAddCard(list.id)}
                                      >
                                        Add Card
                                      </button>
                                      <button
                                        className="text-gray-500"
                                        onClick={() => {
                                          setAddingCards({
                                            ...addingCards,
                                            [list.id]: false,
                                          });
                                          setNewCardTitles({
                                            ...newCardTitles,
                                            [list.id]: "",
                                          });
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    className="w-full text-left px-2 py-1 mt-2 text-gray-600 hover:bg-gray-200 rounded"
                                    onClick={() =>
                                      setAddingCards({
                                        ...addingCards,
                                        [list.id]: true,
                                      })
                                    }
                                  >
                                    + Add another card
                                  </button>
                                )}
                              </div>
                            )}
                          </Droppable>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}

                <div className="flex-shrink-0 w-72">
                  {addingList ? (
                    <div className="bg-gray-100 rounded-md p-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        autoFocus
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          className="bg-[#2563eb] text-white px-3 py-1 rounded"
                          onClick={handleAddList}
                        >
                          Add List
                        </button>
                        <button
                          className="text-gray-500"
                          onClick={() => {
                            setAddingList(false);
                            setNewListTitle("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 bg-opacity-80 rounded-md h-min">
                      <div className="p-2">
                        <button
                          className="w-full text-left px-2 py-1 text-gray-600 hover:bg-gray-200 rounded"
                          onClick={() => setAddingList(true)}
                        >
                          + Add another list
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <CardDetailsModal
          isOpen={isCardDetailsModalOpen}
          onClose={() => setIsCardDetailsModalOpen(false)}
          card={selectedCard}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          boardBackgroundColor={board?.backgroundColor || "#2563eb"}
        />
      </div>
    </DashboardLayout>
  );
};

export default BoardView;
