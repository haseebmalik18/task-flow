import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import BoardCard from "../components/boards/BoardCard";
import CreateBoardModal from "../components/boards/CreateBoardModal";
import { boardService, Board } from "../components/services/api/board";
import LoadingSpinner from "../components/common/LoadingSpinner";

const Dashboard = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        setIsLoading(true);
        const data = await boardService.getBoards();
        setBoards(data);
      } catch (err) {
        setError("Failed to load boards");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  const handleCreateBoard = async (title: string, backgroundColor: string) => {
    const response = await boardService.createBoard({
      title,
      backgroundColor,
      workspace: "Personal",
    });

    setBoards([response, ...boards]);
    return response.id.toString();
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

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Boards</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col items-center justify-center h-32 hover:shadow-md transition-shadow cursor-pointer"
          >
            <svg
              className="h-10 w-10 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="mt-2 text-sm font-medium text-gray-600">
              Create New Board
            </span>
          </div>

          {boards.length > 0 ? (
            boards.map((board) => (
              <BoardCard
                key={board.id}
                id={board.id.toString()}
                title={board.title}
                backgroundColor={board.backgroundColor}
                workspace={board.workspace}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-gray-500">
              No boards yet. Create your first board to get started!
            </div>
          )}
        </div>
      </div>

      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateBoard={handleCreateBoard}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
