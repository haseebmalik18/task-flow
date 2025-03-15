import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
        setLists(listsData);
      } catch (err) {
        console.error("Error fetching board data:", err);
        setError("Failed to load board details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoardData();
  }, [id]);

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

        <div className="flex overflow-x-auto pb-4">
          <div className="flex space-x-4">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-gray-100 rounded-md w-72 flex-shrink-0 max-h-[calc(100vh-200px)]"
              >
                <div className="p-2">
                  <h3 className="font-medium px-2 py-1">{list.title}</h3>
                  <div className="mt-2 space-y-2 overflow-y-auto">
                    {list.cards &&
                      list.cards.map((card) => (
                        <div
                          key={card.id}
                          className="bg-white p-2 rounded shadow cursor-pointer"
                        >
                          <p>{card.title}</p>
                        </div>
                      ))}

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
                          setAddingCards({ ...addingCards, [list.id]: true })
                        }
                      >
                        + Add another card
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {addingList ? (
              <div className="bg-gray-100 rounded-md w-72 flex-shrink-0 p-2">
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
              <div className="bg-gray-100 bg-opacity-80 rounded-md w-72 flex-shrink-0 h-min">
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
      </div>
    </DashboardLayout>
  );
};

export default BoardView;
