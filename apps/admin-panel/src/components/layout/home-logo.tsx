import React from 'react';
import { useLocation } from 'wouter';
import { trackPageView } from '@/lib/analytics';
import './home-logo.css';

interface HomeLogoProps {
  className?: string;
}

const HomeLogo: React.FC<HomeLogoProps> = ({ className = '' }) => {
  const [, navigate] = useLocation();

  const handleHomeClick = () => {
    navigate('/');

    // Dispatch event to reset search interface
    const resetEvent = new CustomEvent('resetSearchInterface', {
      detail: { reset: true }
    });
    window.dispatchEvent(resetEvent);

    // Track virtual page view for analytics
    trackPageView('/', 'Home');
  };

  return (
    <button
      className={`home-logo-button ${className}`}
      onClick={handleHomeClick}
      aria-label="Go to Home"
      title="Home"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="6" y="6" width="12" height="12" />
      </svg>
    </button>
  );
};

export default HomeLogo;
