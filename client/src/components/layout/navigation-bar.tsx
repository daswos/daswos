import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useDasbar } from '@/contexts/dasbar-context';
import DasbarBackButton from './dasbar-back-button';
import DasbarForwardButton from './dasbar-forward-button';
import DasWosIconLogo from '@/components/daswos-icon-logo';
import './navigation-bar.css'; // Import navigation bar styles

interface NavigationBarProps {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({
  className = ''
}) => {
  const [location, navigate] = useLocation();
  const { isLoading } = useDasbar();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
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

  if (isLoading) {
    return (
      <div className="fixed bottom-[15px] left-[20px] z-[1001] flex items-center space-x-1 opacity-50">
        {/* Logo button (disabled while loading) */}
        <button className="nav-button home-logo-button" disabled>
          <div className="h-6 w-6 bg-black animate-pulse flex items-center justify-center relative">
            <div className="absolute top-1 left-1 w-3 h-3 bg-gray-300"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-gray-300"></div>
          </div>
        </button>

        {/* Back button (disabled while loading) */}
        <button className="nav-button back-button" disabled>
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Forward button (disabled while loading) */}
        <button className="nav-button forward-button" disabled>
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    );
  }

  const { items } = useDasbar();

  return (
    <>
      {/* Expandable dasbar */}
      <div
        className={`dasbar-items fixed left-[20px] bottom-[70px] z-[1001] flex flex-col-reverse space-y-reverse space-y-2 transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {items.filter(item => item.id !== 'home').map((item, index) => (
          <button
            key={item.id}
            className="dasbar-item w-[40px] h-[40px] bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center"
            onClick={() => {
              navigate(item.path);
              setIsExpanded(false);
            }}
            aria-label={`Go to ${item.label}`}
            title={item.label}
            style={{
              transitionDelay: isExpanded ? `${index * 50}ms` : '0ms',
              transform: isExpanded ? 'translateY(0)' : 'translateY(10px)'
            }}
          >
            {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-[15px] left-[20px] z-[1001] flex items-center space-x-1">
        {/* Expand button */}
        <button
          className={`nav-button home-logo-button relative ${isExpanded ? 'ring-2 ring-white dark:ring-gray-700' : ''}`}
          onClick={toggleExpand}
          aria-label={isExpanded ? "Collapse dasbar" : "Expand dasbar"}
          title={isExpanded ? "Collapse" : "Expand"}
        >
          <DasWosIconLogo height={24} width={24} className="dasbar-logo" />

          <span className="sr-only">{isExpanded ? "Collapse" : "Expand"} Dasbar</span>
        </button>

        {/* Back button */}
        <DasbarBackButton />

        {/* Forward button */}
        <DasbarForwardButton />
      </div>
    </>
  );
};

export default NavigationBar;
