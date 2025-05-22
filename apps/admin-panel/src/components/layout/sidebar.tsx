import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { History, Settings, Home, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { IconButton } from '@/components/ui/icon-button';
import { useDasbar } from '@/contexts/dasbar-context';
import { trackPageView } from '@/lib/analytics';
import DasbarBackButton from './dasbar-back-button';
import DasbarForwardButton from './dasbar-forward-button';
import './navigation-bar.css';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const [location, navigate] = useLocation();
  const { items } = useDasbar();
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to handle expand/collapse of the dasbar
  const handleHomeClick = () => {
    // Simply toggle the expanded state
    setIsExpanded(!isExpanded);
  };

  // Add event listener to close dasbar when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if dasbar is expanded and the click is outside the dasbar
      if (isExpanded) {
        const target = event.target as HTMLElement;
        const dasbarItems = document.querySelector('.dasbar-items');
        const expandButton = document.querySelector('.home-logo-button');

        // If the click is not on the dasbar items or the expand button, collapse the dasbar
        if (dasbarItems && expandButton &&
            !dasbarItems.contains(target) &&
            !expandButton.contains(target)) {
          setIsExpanded(false);
        }
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <>
      {/* Expandable dasbar */}
      <div
        className={`dasbar-items fixed left-0 top-[60px] z-[1001] flex flex-col space-y-0 transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-10px] pointer-events-none'
        }`}
      >

        {/* Other dasbar items */}
        {items.filter(item => item.id !== 'home').map((item, index) => (
          <button
            key={item.id}
            className="dasbar-item w-[60px] h-[60px] flex items-center justify-center"
            onClick={() => {
              // Navigate using SPA structure
              navigate(item.path);
              setIsExpanded(false);

              // Track virtual page view for analytics
              trackPageView(item.path, item.label);
            }}
            aria-label={`Go to ${item.label}`}
            title={item.label}
            style={{
              transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
              transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)'
            }}
          >
            {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
          </button>
        ))}

        {/* History button */}
        <button
          className="dasbar-item w-[60px] h-[60px] flex items-center justify-center"
          onClick={() => {
            navigate('/history');
            setIsExpanded(false);
            trackPageView('/history', 'History');
          }}
          aria-label="Go to History"
          title="History"
          style={{
            transitionDelay: isExpanded ? `${items.length * 50}ms` : '0ms',
            transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)'
          }}
        >
          <History className="h-5 w-5" />
        </button>

        {/* Settings button */}
        <button
          className="dasbar-item w-[60px] h-[60px] flex items-center justify-center"
          onClick={() => {
            navigate('/user-settings');
            setIsExpanded(false);
            trackPageView('/user-settings', 'Settings');
          }}
          aria-label="Go to Settings"
          title="Settings"
          style={{
            transitionDelay: isExpanded ? `${(items.length + 1) * 50}ms` : '0ms',
            transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)'
          }}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Main sidebar */}
      <div className={`fixed left-0 top-[60px] bottom-[70px] w-[60px] bg-[#E0E0E0] dark:bg-[#222222] flex flex-col items-center py-4 z-[1000] sidebar-container ${className}`}>
        {/* This is now an empty container that just provides the background */}
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 z-[1001] flex flex-col items-center navigation-bar bg-[#E0E0E0] dark:bg-[#222222] w-[60px] py-2">
        {/* Expand button */}
        <button
          className={`nav-button expand-button relative group ${isExpanded ? 'text-white dark:text-white' : ''}`}
          onClick={handleHomeClick}
          aria-label={isExpanded ? "Collapse dasbar" : "Expand dasbar"}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">{isExpanded ? "Collapse" : "Expand"} Dasbar</span>
          <span className="absolute left-16 bg-[#E0E0E0] dark:bg-[#222222] text-[#333333] dark:text-[#cccccc] px-2 py-1 text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-[1002]">
            {isExpanded ? "Collapse" : "Expand"}
          </span>
        </button>

        {/* Back button */}
        <DasbarBackButton />

        {/* Forward button */}
        <DasbarForwardButton />
      </div>
    </>
  );
};

export default Sidebar;
