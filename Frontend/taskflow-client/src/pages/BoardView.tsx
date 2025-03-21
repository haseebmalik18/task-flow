import React, { useState, useEffect } from "react";
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
import { cardService, Card } from "../components/services/api/card";
import LoadingSpinner from "../components/common/LoadingSpinner";

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

  useEffect(() => {
    const fetchBoardData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const boardData = await boardService.getBoard(id);
        setBoard(boardData);

        const listsData = await listService.getListsByBoard(id);
        console.log("Lists data from server:", listsData);

        // Sort lists by position explicitly
        const sortedLists = [...listsData].sort(
          (a, b) => a.position - b.position
        );

        // Also sort cards within each list
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

  // Function to refresh board data from server
  const refreshBoardData = async () => {
    try {
      if (!id) return;

      const listsData = await listService.getListsByBoard(id);
      console.log("Refreshed lists data:", listsData);

      // Sort lists by position explicitly
      const sortedLists = [...listsData].sort(
        (a, b) => a.position - b.position
      );

      // Also sort cards within each list
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

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    // If there's no destination, item was dropped outside droppable area
    if (!destination) {
      return;
    }

    // If destination is same as source, no movement
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Handle list reordering
    if (type === "list") {
      // Get the list ID from the draggableId (format is "list-{id}")
      const listId = parseInt(draggableId.replace("list-", ""));

      // Create a new array with the lists in the new order
      const reorderedLists = Array.from(lists);
      const [removed] = reorderedLists.splice(source.index, 1);
      reorderedLists.splice(destination.index, 0, removed);

      // Update the UI immediately for responsiveness
      setLists(reorderedLists);

      try {
        // Update the list position on the backend
        const updatedList = await listService.updateList(listId, {
          title: removed.title,
          boardId: parseInt(id || "0"),
          position: destination.index,
        });

        console.log(
          `List ${listId} moved to position ${destination.index}`,
          updatedList
        );

        // Refresh data from server to ensure consistency
        await refreshBoardData();
      } catch (err) {
        console.error("Error updating list position:", err);
        // Optionally revert the UI if the backend update fails
        // setLists(lists);
      }

      return;
    }

    // Handle card reordering
    const sourceListId = parseInt(source.droppableId);
    const destinationListId = parseInt(destination.droppableId);

    // Create a deep copy of the lists
    const newLists = lists.map((list) => ({
      ...list,
      cards: list.cards ? [...list.cards] : [],
    }));

    // Find the source and destination list
    const sourceList = newLists.find((list) => list.id === sourceListId);
    const destinationList = newLists.find(
      (list) => list.id === destinationListId
    );

    if (!sourceList || !destinationList) return;

    // Moving card in the same list
    if (sourceListId === destinationListId) {
      // Get the card ID from the draggableId (format is "card-{id}")
      const cardId = parseInt(draggableId.replace("card-", ""));

      // Reorder the cards in the source list
      const cards = Array.from(sourceList.cards || []);
      const [removed] = cards.splice(source.index, 1);
      cards.splice(destination.index, 0, removed);

      // Update the UI immediately
      sourceList.cards = cards;
      setLists(newLists);

      try {
        // Update the card position on the backend
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

        // Refresh data from server to ensure consistency
        await refreshBoardData();
      } catch (err) {
        console.error("Error updating card position:", err);
        // Optionally revert the UI if the backend update fails
      }
    }
    // Moving card between lists
    else {
      // Get the card ID from the draggableId
      const cardId = parseInt(draggableId.replace("card-", ""));

      // Remove from source list
      const sourceCards = Array.from(sourceList.cards || []);
      const [removed] = sourceCards.splice(source.index, 1);
      sourceList.cards = sourceCards;

      // Add to destination list
      const destinationCards = Array.from(destinationList.cards || []);
      // Update the card's listId
      const updatedCard = { ...removed, listId: destinationListId };
      destinationCards.splice(destination.index, 0, updatedCard);
      destinationList.cards = destinationCards;

      // Update the UI immediately
      setLists(newLists);

      try {
        // Update the card on the backend (moving to new list and position)
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

        // Refresh data from server to ensure consistency
        await refreshBoardData();
      } catch (err) {
        console.error("Error moving card between lists:", err);
        // Optionally revert the UI if the backend update fails
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

                {/* Add new list section */}
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
      </div>
    </DashboardLayout>
  );
};

export default BoardView;
