import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A hook that enables backspace key navigation to the previous page,
 * but only when the user is not typing in an input field.
 */
export function useBackspaceNavigation() {
  const [, navigate] = useLocation();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the key pressed is backspace
      if (event.key === 'Backspace') {
        // Get the active element
        const activeElement = document.activeElement;
        
        // Check if the active element is an input field, textarea, or has contentEditable attribute
        const isTyping = 
          activeElement instanceof HTMLInputElement || 
          activeElement instanceof HTMLTextAreaElement || 
          activeElement instanceof HTMLSelectElement ||
          activeElement?.getAttribute('contenteditable') === 'true';
        
        // If not typing, navigate back
        if (!isTyping) {
          event.preventDefault(); // Prevent the default backspace action
          
          // Try to go back in history if possible
          if (window.history.length > 1) {
            window.history.back();
          } else {
            // If no history, navigate to the home page
            navigate('/');
          }
        }
      }
    };

    // Add event listener
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate]);
}
