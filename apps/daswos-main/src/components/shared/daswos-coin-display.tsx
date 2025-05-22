import { Coins } from "lucide-react";
import DasWosCoinIcon from "./daswos-coin-icon";

interface DasWosCoinDisplayProps {
  coinBalance: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A component for displaying DasWos coin balance
 */
const DasWosCoinDisplay = ({
  coinBalance,
  size = "md",
  className = "",
}: DasWosCoinDisplayProps) => {
  // Determine size classes
  const containerClasses = {
    sm: "text-sm px-2 py-1",
    md: "text-base px-3 py-1.5", 
    lg: "text-lg px-4 py-2",
  };

  const iconClasses = {
    sm: "h-3.5 w-3.5 mr-1", 
    md: "h-4 w-4 mr-1.5",
    lg: "h-5 w-5 mr-2",
  };
  
  return (
    <div 
      className={`flex items-center bg-primary-foreground border border-primary/20 rounded-full ${containerClasses[size]} ${className}`}
    >
      <DasWosCoinIcon className={`text-primary ${iconClasses[size]}`} />
      <span className="font-medium">{coinBalance.toLocaleString()}</span>
    </div>
  );
};

export default DasWosCoinDisplay;