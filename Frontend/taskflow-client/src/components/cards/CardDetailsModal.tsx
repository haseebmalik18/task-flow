// src/components/cards/CardDetailsModal.tsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../components/context/AuthContext";
import { Card } from "../services/api/card";
import {
  Comment,
  commentService,
  CreateCommentRequest,
} from "../services/api/comment";
import {
  ChecklistItem,
  checklistItemService,
  CreateChecklistItemRequest,
} from "../services/api/checklistItem";
import LoadingSpinner from "../common/LoadingSpinner";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  onUpdateCard: (card: Card) => Promise<void>;
  onDeleteCard?: () => Promise<void>;
  boardBackgroundColor: string;
}

const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  isOpen,
  onClose,
  card,
  onUpdateCard,
  onDeleteCard,
  boardBackgroundColor,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [addingChecklistItem, setAddingChecklistItem] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title || "");
      setDescription(card.description || "");

      // Fetch card details, comments and checklist items
      const fetchCardDetails = async () => {
        try {
          setLoading(true);

          // Fetch comments and checklist items in parallel
          const [commentsData, checklistItemsData] = await Promise.all([
            commentService.getCommentsByCard(card.id),
            checklistItemService.getChecklistItemsByCard(card.id),
          ]);

          setComments(commentsData);
          setChecklistItems(checklistItemsData);
        } catch (error) {
          console.error("Error fetching card details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchCardDetails();
    }
  }, [card]);

  if (!isOpen || !card) return null;

  const handleSubmit = async () => {
    if (!card) return;

    try {
      setSaving(true);
      await onUpdateCard({
        ...card,
        title,
        description,
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating card:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!card || !newComment.trim()) return;

    try {
      const commentRequest: CreateCommentRequest = {
        content: newComment,
        cardId: card.id,
      };

      const createdComment = await commentService.createComment(commentRequest);
      setComments([createdComment, ...comments]);
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Continuing src/components/cards/CardDetailsModal.tsx

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentService.deleteComment(commentId);
      setComments(comments.filter((comment) => comment.id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleAddChecklistItem = async () => {
    if (!card || !newChecklistItem.trim()) return;

    try {
      const checklistItemRequest: CreateChecklistItemRequest = {
        content: newChecklistItem,
        cardId: card.id,
        completed: false,
      };

      const createdItem = await checklistItemService.createChecklistItem(
        checklistItemRequest
      );
      setChecklistItems(
        [...checklistItems, createdItem].sort((a, b) => a.position - b.position)
      );
      setNewChecklistItem("");
      setAddingChecklistItem(false);
    } catch (error) {
      console.error("Error adding checklist item:", error);
    }
  };

  const handleToggleChecklistItem = async (item: ChecklistItem) => {
    try {
      const updatedItem = await checklistItemService.updateChecklistItem(
        item.id,
        {
          ...item,
          content: item.content,
          cardId: item.cardId,
          completed: !item.completed,
        }
      );

      setChecklistItems(
        checklistItems.map((i) => (i.id === updatedItem.id ? updatedItem : i))
      );
    } catch (error) {
      console.error("Error updating checklist item:", error);
    }
  };

  const handleDeleteChecklistItem = async (itemId: number) => {
    try {
      await checklistItemService.deleteChecklistItem(itemId);
      setChecklistItems(checklistItems.filter((item) => item.id !== itemId));
    } catch (error) {
      console.error("Error deleting checklist item:", error);
    }
  };

  // Calculate checklist completion percentage
  const completedItems = checklistItems.filter((item) => item.completed).length;
  const checklistTotal = checklistItems.length;
  const completionPercentage = checklistTotal
    ? Math.round((completedItems / checklistTotal) * 100)
    : 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="card-details-modal"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          aria-hidden="true"
        ></div>

        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <LoadingSpinner size="large" />
            </div>
          ) : (
            <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  {/* Card header with color bar */}
                  <div
                    className="h-2 w-full mb-4 rounded-t-md"
                    style={{ backgroundColor: boardBackgroundColor }}
                  ></div>

                  {/* Card title */}
                  <div className="mb-6">
                    {isEditing ? (
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 text-xl font-bold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Card title"
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900">
                          {title}
                        </h3>
                        <button
                          onClick={() => setIsEditing(true)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                            />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <h4 className="mb-2 text-sm font-medium text-gray-700">
                      Description
                    </h4>
                    {isEditing ? (
                      <div className="mb-4">
                        <ReactQuill
                          theme="snow"
                          value={description}
                          onChange={setDescription}
                          placeholder="Add a more detailed description..."
                          modules={{
                            toolbar: [
                              [{ header: [1, 2, 3, false] }],
                              ["bold", "italic", "underline", "strike"],
                              [{ list: "ordered" }, { list: "bullet" }],
                              ["link", "image"],
                              ["clean"],
                            ],
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="p-3 prose rounded-md bg-gray-50 hover:bg-gray-100"
                        onClick={() => setIsEditing(true)}
                      >
                        {description ? (
                          <div
                            dangerouslySetInnerHTML={{ __html: description }}
                          />
                        ) : (
                          <p className="text-gray-500 italic">
                            Add a more detailed description...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">
                        Checklist
                      </h4>
                      <span className="text-sm text-gray-500">
                        {completedItems}/{checklistTotal}
                      </span>
                    </div>

                    {checklistTotal > 0 && (
                      <div className="mb-3">
                        <div className="h-2 w-full bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-500 rounded-full"
                            style={{ width: `${completionPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    <ul className="space-y-2">
                      {checklistItems.map((item) => (
                        <li key={item.id} className="flex items-start group">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklistItem(item)}
                            className="mt-1 mr-3 text-blue-500 rounded focus:ring-blue-500"
                          />
                          <span
                            className={`flex-grow ${
                              item.completed ? "line-through text-gray-400" : ""
                            }`}
                          >
                            {item.content}
                          </span>
                          <button
                            onClick={() => handleDeleteChecklistItem(item.id)}
                            className="hidden p-1 ml-2 text-gray-400 hover:text-red-500 group-hover:block"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>

                    {addingChecklistItem ? (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={newChecklistItem}
                          onChange={(e) => setNewChecklistItem(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Add an item"
                          autoFocus
                        />
                        <div className="flex mt-2 space-x-2">
                          <button
                            onClick={handleAddChecklistItem}
                            className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Add
                          </button>
                          <button
                            onClick={() => {
                              setAddingChecklistItem(false);
                              setNewChecklistItem("");
                            }}
                            className="px-3 py-1 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingChecklistItem(true)}
                        className="flex items-center mt-3 text-sm text-gray-600 hover:text-gray-900"
                      >
                        <svg
                          className="w-5 h-5 mr-1"
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
                        Add an item
                      </button>
                    )}
                  </div>

                  {/* Comments */}
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Comments
                    </h4>

                    {/* Add comment form */}
                    <div className="flex mb-4">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {user?.firstName?.charAt(0) || "U"}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Write a comment..."
                          rows={2}
                        />
                        {newComment.trim() && (
                          <button
                            onClick={handleAddComment}
                            className="mt-2 px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                          >
                            Save
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-4">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="flex">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-sm">
                                {comment.author.firstName.charAt(0)}
                              </div>
                            </div>
                            <div className="flex-grow">
                              <div className="flex items-center mb-1">
                                <h5 className="font-medium text-gray-900">
                                  {comment.author.firstName}{" "}
                                  {comment.author.lastName}
                                </h5>
                                <span className="ml-2 text-xs text-gray-500">
                                  {format(
                                    new Date(comment.createdAt),
                                    "MMM d, yyyy HH:mm"
                                  )}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.content}</p>

                              {/* Show delete button if user is the author */}
                              {user?.id === comment.author.id && (
                                <button
                                  onClick={() =>
                                    handleDeleteComment(comment.id)
                                  }
                                  className="text-xs text-gray-500 hover:text-red-500 mt-1"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No comments yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer with actions */}
          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
            {isEditing && (
              <>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setTitle(card?.title || "");
                    setDescription(card?.description || "");
                  }}
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </>
            )}

            {!isEditing && onDeleteCard && (
              <button
                type="button"
                onClick={onDeleteCard}
                className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Delete Card
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardDetailsModal;
