import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

interface CreateBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateBoard: (title: string, backgroundColor: string) => Promise<string>;
}

const backgroundColors = [
  "#2563eb", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#84cc16", // Green
  "#14b8a6", // Teal
];

const CreateBoardModal: React.FC<CreateBoardModalProps> = ({
  isOpen,
  onClose,
  onCreateBoard,
}) => {
  const [title, setTitle] = useState("");
  const [selectedColor, setSelectedColor] = useState(backgroundColors[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Board title is required");
      return;
    }

    try {
      setIsLoading(true);
      const boardId = await onCreateBoard(title, selectedColor);
      onClose();
      navigate(`/board/${boardId}`);
    } catch (err) {
      setError("Failed to create board");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 animate-[fadeIn_0.2s_ease-in]">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Create Board
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Board Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2563eb]/20 focus:border-[#2563eb]"
                placeholder="Enter board title"
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Background Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {backgroundColors.map((color) => (
                  <div
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-full h-10 rounded-md cursor-pointer ${
                      selectedColor === color
                        ? "ring-2 ring-[#2563eb] ring-offset-2"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-[#2563eb]/90 disabled:bg-[#2563eb]/50"
              >
                {isLoading ? "Creating..." : "Create Board"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
