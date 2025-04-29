import React from 'react';
import { useLocation } from 'wouter';
import { MoreHorizontal, Settings } from 'lucide-react';
import { useDasbar } from '@/contexts/dasbar-context';
import { useAuth } from '@/hooks/use-auth';
import DasbarMoreMenu from './dasbar-more-menu';
import './dasbar.css'; // Import dasbar styles

interface NavigationBarProps {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  className = ''
}) => {
  const [location, navigate] = useLocation();
  const { visibleItems, moreItems, isLoading } = useDasbar();
  const { user } = useAuth();

  // Check if the current path matches the item path
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  if (isLoading) {
    return (
      <div className={`border border-gray-400 dark:border-gray-600 flex justify-center bg-gray-200 dark:bg-gray-800 fixed z-50 dasbar ${className}`}>
        <div className="container mx-auto flex justify-center relative">
          <div className="w-full max-w-xl flex text-sm justify-around items-center">
            <div className="text-xs text-gray-500">Loading navigation...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-gray-400 dark:border-gray-600 flex justify-center bg-gray-200 dark:bg-gray-800 fixed z-50 dasbar ${className}`}>
      <div className="container mx-auto flex justify-center relative">
        <div className="w-full max-w-xl flex text-sm justify-around">
          {visibleItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`
                  flex-1 py-2 mx-1 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors
                  rounded-lg
                  ${isActive(item.path) ? 'bg-gray-300 dark:bg-gray-700 active font-medium' : ''}
                `}
                onClick={() => navigate(item.path)}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-1">
                    {IconComponent && <IconComponent className="h-5 w-5" />}
                  </div>
                  <span className="text-xs font-medium">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* More menu for additional items */}
          {moreItems.length > 0 && (
            <DasbarMoreMenu className="flex-1 py-2 mx-1" />
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
