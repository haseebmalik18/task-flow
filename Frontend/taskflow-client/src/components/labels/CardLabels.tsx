import React from "react";
import { Label } from "../services/api/label";
import LabelPill from "./LabelPill";
import { MAX_VISIBLE_LABELS } from "./labelConstants";

interface CardLabelsProps {
  labels: Label[];
  onLabelClick?: (label: Label) => void;
  showNames?: boolean;
  className?: string;
}

const CardLabels: React.FC<CardLabelsProps> = ({
  labels,
  onLabelClick,
  showNames = false,
  className = "",
}) => {
  if (!labels || labels.length === 0) return null;

  const visibleLabels = labels.slice(0, MAX_VISIBLE_LABELS);
  const hiddenCount = Math.max(0, labels.length - MAX_VISIBLE_LABELS);

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleLabels.map((label) => (
        <LabelPill
          key={label.id}
          label={label}
          size="sm"
          showName={showNames}
          onClick={() => onLabelClick?.(label)}
        />
      ))}

      {hiddenCount > 0 && (
        <div className="inline-flex items-center px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md">
          +{hiddenCount}
        </div>
      )}
    </div>
  );
};

export default CardLabels;
