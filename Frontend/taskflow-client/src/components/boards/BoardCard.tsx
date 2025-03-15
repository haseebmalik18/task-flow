import React from "react";
import { useNavigate } from "react-router-dom";

interface BoardCardProps {
  id: string;
  title: string;
  backgroundColor?: string;
  workspace?: string;
}

const BoardCard: React.FC<BoardCardProps> = ({
  id,
  title,
  backgroundColor = "#2563eb",
  workspace = "Personal",
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/board/${id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="h-24" style={{ backgroundColor }}></div>
      <div className="p-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{workspace}</p>
      </div>
    </div>
  );
};

export default BoardCard;
