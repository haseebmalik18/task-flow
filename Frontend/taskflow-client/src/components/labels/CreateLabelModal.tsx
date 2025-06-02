import React, { useState } from "react";
import { Label, labelService } from "../services/api/label";
import { PREDEFINED_COLORS } from "./labelConstants";
import LabelPill from "./LabelPill";

interface CreateLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  onCreateLabel: (label: Label) => void;
}

const CreateLabelModal: React.FC<CreateLabelModalProps> = ({
  isOpen,
  onClose,
  boardId,
  onCreateLabel,
}) => {
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(
    PREDEFINED_COLORS[0].color
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Label name is required");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const newLabel = await labelService.createLabel({
        name: name.trim(),
        color: selectedColor,
        boardId,
      });

      onCreateLabel(newLabel);
      setName("");
      setSelectedColor(PREDEFINED_COLORS[0].color);
      onClose();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create label"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setSelectedColor(PREDEFINED_COLORS[0].color);
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const previewLabel: Label = {
    id: 0,
    name: name || "Label preview",
    color: selectedColor,
    boardId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Create Label
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Preview
              </label>
              <div className="p-3 bg-gray-50 rounded-md">
                <LabelPill label={previewLabel} size="md" showName={true} />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter label name"
              />
              <p className="text-sm text-gray-500 mt-1">
                {name.length}/30 characters
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">
                Color
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PREDEFINED_COLORS.map((colorOption) => (
                  <button
                    key={colorOption.color}
                    type="button"
                    onClick={() => setSelectedColor(colorOption.color)}
                    className={`w-full h-10 rounded-md transition-all ${
                      selectedColor === colorOption.color
                        ? "ring-2 ring-blue-500 ring-offset-2"
                        : "hover:ring-2 hover:ring-gray-300 hover:ring-offset-2"
                    }`}
                    style={{ backgroundColor: colorOption.color }}
                    title={colorOption.name}
                  >
                    {selectedColor === colorOption.color && (
                      <svg
                        className="w-5 h-5 text-white mx-auto"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isLoading ? "Creating..." : "Create Label"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateLabelModal;
