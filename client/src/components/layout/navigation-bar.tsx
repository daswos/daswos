import React from 'react';
import { useLocation } from 'wouter';
import { MoreHorizontal, Settings, Home } from 'lucide-react';
import { useDasbar } from '@/contexts/dasbar-context';
import { useAuth } from '@/hooks/use-auth';
import DasbarMoreMenu from './dasbar-more-menu';
import DasbarBackButton from './dasbar-back-button';
import DasbarForwardButton from './dasbar-forward-button';
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

  // Filter out the home item from visible items to avoid duplication
  const filteredVisibleItems = visibleItems.filter(item => item.id !== 'home');

  return (
    <div className={`border border-gray-400 dark:border-gray-600 flex justify-center bg-gray-200 dark:bg-gray-800 fixed z-50 dasbar ${className}`}>
      <div className="container mx-auto flex justify-center relative">
        {/* Navigation group on the left */}
        <div className="navigation-group-left">
          {/* Back button - on the far left */}
          <DasbarBackButton />

          {/* Forward button - between back and home */}
          <DasbarForwardButton />

          {/* Home button - to the right of the forward button */}
          <button
            className="nav-button home-button"
            onClick={() => navigate('/')}
            aria-label="Go to home page"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
        </div>

        {/* Main navigation items - moved more to the right and closer together */}
        <div className="navigation-group-right">
          {filteredVisibleItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                className={`
                  nav-item text-black dark:text-white transition-colors
                  ${isActive(item.path) ? 'active' : ''}
                `}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
              >
                {IconComponent && <IconComponent className="h-5 w-5" />}
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* More menu for additional items - always show it */}
          <DasbarMoreMenu className="nav-item" />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
