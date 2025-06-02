import React, { useState, useEffect } from "react";
import { Label } from "../services/api/label";
import { labelService } from "../services/api/label";
import LabelPill from "./LabelPill";
import CreateLabelModal from "./CreateLabelModal";
import LoadingSpinner from "../common/LoadingSpinner";

interface LabelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: number;
  cardLabels: Label[];
  onToggleLabel: (label: Label, isSelected: boolean) => void;
}

const LabelSelectorModal: React.FC<LabelSelectorModalProps> = ({
  isOpen,
  onClose,
  boardId,
  cardLabels,
  onToggleLabel,
}) => {
  const [boardLabels, setBoardLabels] = useState<Label[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchBoardLabels();
    }
  }, [isOpen, boardId]);

  const fetchBoardLabels = async () => {
    try {
      setIsLoading(true);
      const labels = await labelService.getLabelsByBoard(boardId);
      setBoardLabels(labels);
    } catch (error) {
      console.error("Error fetching board labels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLabels = boardLabels.filter((label) =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLabelSelected = (label: Label) =>
    cardLabels.some((cardLabel) => cardLabel.id === label.id);

  const handleToggleLabel = (label: Label) => {
    const isSelected = isLabelSelected(label);
    onToggleLabel(label, isSelected);
  };

  const handleCreateLabel = (newLabel: Label) => {
    setBoardLabels([...boardLabels, newLabel]);
    setShowCreateModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-96 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Labels</h3>
              <button
                onClick={onClose}
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

            <input
              type="text"
              placeholder="Search labels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner size="medium" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredLabels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleToggleLabel(label)}
                  >
                    <LabelPill label={label} size="md" showName={true} />

                    <div className="flex items-center">
                      {isLabelSelected(label) && (
                        <svg
                          className="w-5 h-5 text-green-500 mr-2"
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
                    </div>
                  </div>
                ))}

                {filteredLabels.length === 0 && !isLoading && (
                  <p className="text-gray-500 text-center py-4">
                    {searchTerm ? "No labels found" : "No labels created yet"}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <svg
                className="w-5 h-5 mr-2"
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
              Create new label
            </button>
          </div>
        </div>
      </div>

      <CreateLabelModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        boardId={boardId}
        onCreateLabel={handleCreateLabel}
      />
    </>
  );
};

export default LabelSelectorModal;
