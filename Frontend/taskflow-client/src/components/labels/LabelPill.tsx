import React from "react";
import { Label } from "../services/api/label";

interface LabelPillProps {
  label: Label;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

const LabelPill: React.FC<LabelPillProps> = ({
  label,
  size = "sm",
  showName = true,
  onClick,
  onRemove,
  className = "",
}) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div
      className={`inline-flex items-center rounded-md font-medium text-white cursor-pointer hover:opacity-80 transition-opacity ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: label.color }}
      onClick={handleClick}
    >
      {showName && <span className="truncate max-w-24">{label.name}</span>}
      {!showName && <span className="w-8 h-4 rounded"></span>}

      {onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/20 transition-colors"
          aria-label="Remove label"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default LabelPill;
