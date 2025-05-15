import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Search, Sun, Moon, Image, X } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import DasWosLogo from '@/components/daswos-logo';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AnimatedTrustText from '@/components/animated-trust-text';
import StatusLabel from '@/components/status-label';

interface MovableSearchInterfaceProps {
  onSearch: (query: string) => void;
  aiModeEnabled?: boolean;
  onToggleAi?: (enabled: boolean) => void;
  activeSphere?: 'safesphere' | 'opensphere';
  onSphereChange?: (sphere: 'safesphere' | 'opensphere') => void;
  superSafeActive?: boolean;
  onToggleSuperSafe?: (active: boolean) => void;
  className?: string;
}

const MovableSearchInterface: React.FC<MovableSearchInterfaceProps> = ({
  onSearch,
  aiModeEnabled = false,
  onToggleAi,
  activeSphere = 'safesphere',
  onSphereChange,
  superSafeActive = false,
  onToggleSuperSafe,
  className = ''
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 350, y: window.innerHeight / 2 - 150 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentQuery, setCurrentQuery] = useState('');


  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Load saved position from localStorage on component mount
  useEffect(() => {
    const savedX = localStorage.getItem('daswos-search-interface-x');
    const savedY = localStorage.getItem('daswos-search-interface-y');

    if (savedX && savedY) {
      setPosition({
        x: parseInt(savedX, 10),
        y: parseInt(savedY, 10)
      });
    }
  }, []);

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('daswos-search-interface-x', position.x.toString());
    localStorage.setItem('daswos-search-interface-y', position.y.toString());
  }, [position]);

  // Handle mouse down for dragging
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
    }
  };

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        // Calculate new position relative to the viewport
        const newX = Math.max(0, Math.min(window.innerWidth - 500, e.clientX - dragOffset.x));
        const newY = Math.max(0, Math.min(window.innerHeight - 200, e.clientY - dragOffset.y));

        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Change cursor during drag
      document.body.style.cursor = 'move';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, dragOffset]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentQuery.trim()) {
      onSearch(currentQuery.trim());
      setCurrentQuery(''); // Clear the input after search
    }
  };



  return (
    <div
      ref={containerRef}
      className={`movable-search-interface ${isDragging ? 'select-none' : ''} ${className}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? 1000 : 100,
        width: '700px',
        backgroundColor: 'transparent',
        padding: '20px 0 0 0',
        transition: isDragging ? 'none' : 'all 0.3s ease',
        overflow: 'hidden'
      }}
    >
      {/* Drag handle */}
      <div
        className="absolute top-0 left-0 right-0 h-8 cursor-move flex items-center justify-center"
        onMouseDown={handleDragStart}
      >
        <div className="w-16 h-1 bg-gray-400 dark:bg-gray-600 rounded-full"></div>
      </div>

      {/* Logo and buttons */}
      <div className="flex flex-col items-center justify-center mb-4 mt-4">
        <div className="relative inline-block">
          <div className="py-1 flex justify-center">
            <DasWosLogo height={70} width="auto" />
          </div>

          {/* Animated Trust Heading */}
          <div className="mt-2 mb-2 w-full text-center">
            <AnimatedTrustText
              sentences={[
                "Helping you find what you need with confidence."
              ]}
              duration={5000}
            />
          </div>

          {/* Buttons container */}
          <div className="absolute right-[-60px] top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="bg-transparent flex items-center justify-center w-8 h-8 text-xs rounded-full hover:bg-gray-100/30 dark:hover:bg-gray-800/30"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Search form */}
      <form onSubmit={handleSubmit} className="flex flex-col space-y-2 px-4 pb-4">
        <div className="relative flex shadow-md rounded-md overflow-hidden">
          <input
            type="text"
            placeholder={aiModeEnabled ? "Ask Daswos..." : "What are you looking for?"}
            value={currentQuery}
            onChange={(e) => setCurrentQuery(e.target.value)}
            className={`w-full px-4 py-3 border border-gray-300 dark:border-gray-600 text-black dark:text-white ${
              aiModeEnabled
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700'
                : 'bg-white dark:bg-[#222222]'
            } focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 rounded-l-md`}
            ref={searchInputRef}
          />
          <button
            type="submit"
            className={`border border-l-0 px-5 search-button rounded-r-md ${
              aiModeEnabled
                ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800'
                : 'bg-white dark:bg-[#222222] border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            } transition-colors`}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
        </div>

        {/* Feature buttons */}
        <div className="flex justify-center mt-2 space-x-2">
          {/* SafeSphere button */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1.5 ${activeSphere === 'safesphere' ? 'w-[185px]' : 'w-[135px]'} cursor-pointer transition-all duration-200`}
            onClick={() => onSphereChange && onSphereChange(activeSphere === 'safesphere' ? 'opensphere' : 'safesphere')}
          >
            {/* Square checkbox */}
            <div className="w-5 h-5 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
              {activeSphere === 'safesphere' && (
                <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              )}
            </div>

            {/* Shield icon */}
            <svg className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>

            {/* Text */}
            <span className="text-gray-900 dark:text-gray-100 font-medium text-sm flex-shrink-0 whitespace-nowrap w-[80px]">SafeSphere</span>

            {/* Status label - only shown when active */}
            {activeSphere === 'safesphere' && (
              <span className="ml-auto text-green-500 text-[9px] font-medium w-[65px] text-right pr-2">Protected</span>
            )}
          </div>

          {/* DasWos AI button with dropdown */}
          <div className="relative">
            {/* Main button */}
            <div
              className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1.5 ${aiModeEnabled ? 'w-[180px]' : 'w-[135px]'} cursor-pointer transition-all duration-200`}
              onClick={() => onToggleAi && onToggleAi(!aiModeEnabled)}
            >
              {/* Square checkbox */}
              <div className="w-5 h-5 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
                {aiModeEnabled && (
                  <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                  </svg>
                )}
              </div>

              {/* TV/Computer icon */}
              <svg className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></rect>
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></line>
              </svg>

              {/* Text */}
              <span className="text-gray-900 dark:text-gray-100 font-medium text-sm flex-shrink-0 whitespace-nowrap w-[80px]">Daswos AI</span>

              {/* Status label - only shown when active */}
              {aiModeEnabled && (
                <span className="ml-auto text-blue-500 text-[10px] font-medium w-[60px] text-right pr-3">Enabled</span>
              )}
            </div>


            </div>

          {/* SuperSafe button */}
          <div
            className={`bg-white dark:bg-gray-800 rounded-sm shadow-sm border border-gray-300 dark:border-gray-600 inline-flex items-center px-2 py-1.5 ${superSafeActive ? 'w-[170px]' : 'w-[135px]'} cursor-pointer transition-all duration-200`}
            onClick={() => onToggleSuperSafe && onToggleSuperSafe(!superSafeActive)}
          >
            {/* Square checkbox */}
            <div className="w-5 h-5 border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
              {superSafeActive && (
                <svg className="w-4 h-4 text-gray-800 dark:text-gray-200" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                </svg>
              )}
            </div>

            {/* Circle check icon */}
            <svg className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-300 flex-shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
            </svg>

            {/* Text */}
            <span className="text-gray-900 dark:text-gray-100 font-medium text-sm flex-shrink-0 whitespace-nowrap w-[80px]">SuperSafe</span>

            {/* Status label - only shown when active */}
            {superSafeActive && (
              <span className="ml-auto text-green-500 text-[10px] font-medium w-[35px] text-right pr-0">Active</span>
            )}
          </div>
        </div>


      </form>
    </div>
  );
};

export default MovableSearchInterface;
