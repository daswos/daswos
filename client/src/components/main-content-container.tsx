import React, { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface MainContentContainerProps {
  children: ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Main content container for the SPA
 * This component will hold all dynamically loaded content
 */
const MainContentContainer: React.FC<MainContentContainerProps> = ({
  children,
  isLoading = false,
  className = '',
}) => {
  // Page tracking is now handled by the PageManager component

  return (
    <div className={`flex-grow bg-[#E0E0E0] dark:bg-[#222222] pb-24 min-h-[calc(100vh-60px)] w-full ${className}`}>
      {isLoading ? (
        <div className="flex items-center justify-center h-full w-full py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Loading content...</span>
        </div>
      ) : (
        <div id="spa-content" className="container mx-auto px-4 py-4 bg-[#E0E0E0] dark:bg-[#222222]">
          {children}
        </div>
      )}
    </div>
  );
};

export default MainContentContainer;
