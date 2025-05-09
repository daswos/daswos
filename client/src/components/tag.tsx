import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TagProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  onRemove?: () => void;
  variant?: "default" | "avoid";
}

export const Tag: React.FC<TagProps> = ({
  label,
  selected,
  onClick,
  onRemove,
  variant = "default"
}) => {
  const isAvoid = variant === "avoid";
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-sm transition-colors",
        "border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50",
        selected
          ? isAvoid
            ? "bg-destructive/10 text-destructive border-destructive"
            : "bg-primary/10 text-primary border-primary"
          : "bg-background border-muted-foreground/30 text-foreground hover:bg-muted/50"
      )}
    >
      {label}
      {selected && onRemove && (
        <X
          size={14}
          className="ml-1.5 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        />
      )}
    </button>
  );
};