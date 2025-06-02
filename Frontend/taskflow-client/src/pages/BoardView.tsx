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
import { labelService, Label } from "../components/services/api/label";
import LoadingSpinner from "../components/common/LoadingSpinner";
import CardDetailsModal from "../components/cards/CardDetailsModal";
import CardLabels from "../components/labels/CardLabels";
import LabelPill from "../components/labels/LabelPill";

const stripHtmlTags = (html: string) => {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const BoardView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [board, setBoard] = useState<any>(null);
  const [lists, setLists] = useState<BoardList[]>([]);
  const [boardLabels, setBoardLabels] = useState<Label[]>([]);
  const [selectedLabelFilter, setSelectedLabelFilter] = useState<Label | null>(
    null
  );
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
        const [boardData, listsData, labelsData] = await Promise.all([
          boardService.getBoard(id),
          listService.getListsByBoard(id),
          labelService.getLabelsByBoard(id),
        ]);

        setBoard(boardData);
        setBoardLabels(labelsData);

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

      const [listsData, labelsData] = await Promise.all([
        listService.getListsByBoard(id),
        labelService.getLabelsByBoard(id),
      ]);

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
      setBoardLabels(labelsData);
    } catch (err) {
      console.error("Error refreshing board data:", err);
    }
  };

  const getFilteredLists = () => {
    if (!selectedLabelFilter) return lists;

    return lists.map((list) => ({
      ...list,
      cards: list.cards.filter((card) =>
        card.labels?.some((label) => label.id === selectedLabelFilter.id)
      ),
    }));
  };

  const getFilteredCardCount = () => {
    if (!selectedLabelFilter) return null;

    const filteredLists = getFilteredLists();
    const totalCards = filteredLists.reduce(
      (count, list) => count + list.cards.length,
      0
    );
    return totalCards;
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

  const handleLabelFilterClick = (label: Label) => {
    setSelectedLabelFilter(selectedLabelFilter?.id === label.id ? null : label);
  };

  const clearLabelFilter = () => {
    setSelectedLabelFilter(null);
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

  const filteredLists = getFilteredLists();
  const filteredCardCount = getFilteredCardCount();

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

        {boardLabels.length > 0 && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  Filter by label:
                </span>
              </div>

              {selectedLabelFilter && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    Showing {filteredCardCount} card
                    {filteredCardCount !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={clearLabelFilter}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm transition-colors"
                  >
                    Show All
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {boardLabels.map((label) => (
                <button
                  key={label.id}
                  onClick={() => handleLabelFilterClick(label)}
                  className={`transition-all duration-200 ${
                    selectedLabelFilter?.id === label.id
                      ? "ring-2 ring-blue-500 ring-offset-2 transform scale-105"
                      : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2 hover:transform hover:scale-105"
                  }`}
                >
                  <LabelPill label={label} size="sm" showName={true} />
                </button>
              ))}
            </div>

            {selectedLabelFilter && filteredCardCount === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  No cards found with the label "
                  <span className="font-medium">
                    {selectedLabelFilter.name}
                  </span>
                  ".
                </p>
              </div>
            )}
          </div>
        )}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                className="flex overflow-x-auto pb-4"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {filteredLists.map((list, index) => (
                  <Draggable
                    key={`list-${list.id}`}
                    draggableId={`list-${list.id}`}
                    index={index}
                    isDragDisabled={selectedLabelFilter !== null}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`mr-4 bg-gray-100 rounded-md w-72 flex-shrink-0 max-h-[calc(100vh-200px)] ${
                          snapshot.isDragging ? "shadow-xl" : ""
                        } ${selectedLabelFilter ? "opacity-90" : ""}`}
                      >
                        <div className="p-2">
                          <div
                            className="font-medium px-2 py-1 flex items-center justify-between"
                            {...(selectedLabelFilter
                              ? {}
                              : provided.dragHandleProps)}
                          >
                            <div className="flex items-center">
                              {!selectedLabelFilter && (
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
                              )}
                              <span>{list.title}</span>
                            </div>

                            {selectedLabelFilter && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                {list.cards.length}
                              </span>
                            )}
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
                                          className={`bg-white p-3 rounded shadow cursor-pointer mb-2 transition-all duration-200 ${
                                            snapshot.isDragging
                                              ? "shadow-lg bg-blue-50 transform rotate-2"
                                              : "hover:shadow-md"
                                          }`}
                                          onClick={() => handleCardClick(card)}
                                        >
                                          <p className="mb-2 font-medium">
                                            {card.title}
                                          </p>

                                          {card.labels &&
                                            card.labels.length > 0 && (
                                              <CardLabels
                                                labels={card.labels}
                                                className="mb-2"
                                                showNames={false}
                                                onLabelClick={(label) =>
                                                  handleLabelFilterClick(label)
                                                }
                                              />
                                            )}

                                          {card.description && (
                                            <p className="text-gray-500 text-sm mt-1 truncate">
                                              {stripHtmlTags(
                                                card.description
                                              ).substring(0, 50)}
                                              {card.description.length > 50
                                                ? "..."
                                                : ""}
                                            </p>
                                          )}

                                          {(card.dueDate ||
                                            (card.labels &&
                                              card.labels.length > 4)) && (
                                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                                              {card.dueDate && (
                                                <div className="flex items-center">
                                                  <svg
                                                    className="w-3 h-3 mr-1"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                  >
                                                    <path
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth="2"
                                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                  </svg>
                                                  <span>Due</span>
                                                </div>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                {provided.placeholder}

                                {addingCards[list.id] ? (
                                  <div className="bg-white p-2 rounded shadow">
                                    <textarea
                                      className="w-full px-2 py-1 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder="Enter a title for this card..."
                                      rows={2}
                                      value={newCardTitles[list.id] || ""}
                                      onChange={(e) =>
                                        setNewCardTitles({
                                          ...newCardTitles,
                                          [list.id]: e.target.value,
                                        })
                                      }
                                      autoFocus
                                    />
                                    <div className="flex space-x-2 mt-2">
                                      <button
                                        className="bg-[#2563eb] text-white px-3 py-1 rounded hover:bg-[#2563eb]/90 transition-colors"
                                        onClick={() => handleAddCard(list.id)}
                                      >
                                        Add Card
                                      </button>
                                      <button
                                        className="text-gray-500 hover:text-gray-700"
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
                                    className="w-full text-left px-2 py-2 mt-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                                    onClick={() =>
                                      setAddingCards({
                                        ...addingCards,
                                        [list.id]: true,
                                      })
                                    }
                                  >
                                    <div className="flex items-center">
                                      <svg
                                        className="w-4 h-4 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                        />
                                      </svg>
                                      Add another card
                                    </div>
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
                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter list title..."
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        autoFocus
                      />
                      <div className="flex space-x-2 mt-2">
                        <button
                          className="bg-[#2563eb] text-white px-3 py-1 rounded hover:bg-[#2563eb]/90"
                          onClick={handleAddList}
                        >
                          Add List
                        </button>
                        <button
                          className="text-gray-500 hover:text-gray-700"
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
                          className="w-full text-left px-2 py-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          onClick={() => setAddingList(true)}
                        >
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            Add another list
                          </div>
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
          boardId={board?.id}
        />
      </div>
    </DashboardLayout>
  );
};

export default BoardView;
