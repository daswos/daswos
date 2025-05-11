import React from 'react';
import { useLocation } from 'wouter';
import { Home } from 'lucide-react';
import { useDasbar } from '@/contexts/dasbar-context';
import DasbarMoreMenu from './dasbar-more-menu';
import DasbarBackButton from './dasbar-back-button';
import DasbarForwardButton from './dasbar-forward-button';
import './dasbar.css'; // Import dasbar styles
import './navigation-bar.css'; // Import navigation bar styles

interface NavigationBarProps {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  className = ''
}) => {
  const [location, navigate] = useLocation();
  const { isLoading } = useDasbar();

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

  const { items } = useDasbar();

  return (
    <div className={`border border-gray-400 dark:border-gray-600 flex justify-center bg-gray-200 dark:bg-gray-800 fixed z-50 dasbar ${className}`}>
      <div className="container mx-auto flex items-center justify-between relative px-2">
        {/* Left navigation group with back, forward, and home buttons */}
        <div className="navigation-group-left flex items-center flex-shrink-0">
          {/* Back button - on the far left */}
          <DasbarBackButton />

          {/* Forward button - between back and home */}
          <DasbarForwardButton />

          {/* Home button - fixed and always visible */}
          <button
            className="nav-button home-button"
            onClick={() => navigate('/')}
            aria-label="Go to home page"
            title="Home"
          >
            <Home className="h-5 w-5" />
            <span>Home</span>
          </button>
        </div>

        {/* Dasbar items group - positioned between home button and collapse button */}
        <div className="navigation-group-dasbar flex items-center">
          {/* All navigation items from the Dasbar context (excluding Home) */}
          {items.filter(item => item.id !== 'home').map((item) => (
            <button
              key={item.id}
              className="dasbar-item"
              onClick={() => navigate(item.path)}
              aria-label={`Go to ${item.label}`}
              title={item.label}
            >
              {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right navigation group with collapse button */}
        <div className="navigation-group-right flex items-center flex-shrink-0">
          {/* Collapse button - positioned at the end of the dasbar */}
          <DasbarMoreMenu className="nav-item" />
        </div>
      </div>
    </div>
  );
};

export default NavigationBar;
