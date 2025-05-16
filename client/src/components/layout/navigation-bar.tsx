import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';
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

  // Function to handle home navigation
  const handleHomeClick = () => {
    // If already expanded, navigate to home and reset search interface
    if (isExpanded) {
      setIsExpanded(false);
      navigate('/');

      // Dispatch event to reset search interface
      const resetEvent = new CustomEvent('resetSearchInterface', {
        detail: { reset: true }
      });
      window.dispatchEvent(resetEvent);
    } else {
      // Just toggle expand if not expanded
      setIsExpanded(true);
    }
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
        {/* Home button at the top of the expanded dasbar */}
        <button
          className="dasbar-item w-[40px] h-[40px] bg-[#E0E0E0] dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center"
          onClick={() => {
            navigate('/');
            setIsExpanded(false);

            // Dispatch event to reset search interface
            const resetEvent = new CustomEvent('resetSearchInterface', {
              detail: { reset: true }
            });
            window.dispatchEvent(resetEvent);

            // Track virtual page view for analytics
            trackPageView('/', 'Home');
          }}
          aria-label="Go to Home"
          title="Home"
          style={{
            transitionDelay: isExpanded ? '0ms' : '0ms',
            transform: isExpanded ? 'translateY(0)' : 'translateY(10px)'
          }}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Other dasbar items */}
        {items.filter(item => item.id !== 'home').map((item, index) => (
          <button
            key={item.id}
            className="dasbar-item w-[40px] h-[40px] bg-[#E0E0E0] dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center"
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
              transform: isExpanded ? 'translateY(0)' : 'translateY(10px)'
            }}
          >
            {item.icon && React.createElement(item.icon, { className: "h-5 w-5" })}
          </button>
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="fixed bottom-[15px] left-[20px] z-[1001] flex items-center space-x-1">
        {/* Expand/Home button */}
        <button
          className={`nav-button home-logo-button relative ${isExpanded ? 'ring-2 ring-white dark:ring-gray-700' : ''}`}
          onClick={handleHomeClick}
          aria-label={isExpanded ? "Go to home page" : "Expand dasbar"}
          title={isExpanded ? "Home" : "Expand"}
        >
          <DasWosIconLogo height={24} width={24} className="dasbar-logo" />

          <span className="sr-only">{isExpanded ? "Go to home page" : "Expand"} Dasbar</span>
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
