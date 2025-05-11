import React, { useState, useEffect } from 'react';

interface AnimatedTrustTextProps {
  sentences: string[]; // Array of sentences to display sequentially
  duration?: number; // Duration in milliseconds for each sentence
}

const AnimatedTrustText: React.FC<AnimatedTrustTextProps> = ({
  sentences,
  duration = 5000, // Default 5 seconds per sentence
}) => {
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Exit if we've shown all sentences
    if (currentSentenceIndex >= sentences.length) {
      return;
    }

    // Display the current sentence for the specified duration
    const displayTimer = setTimeout(() => {
      // Start the fade-out animation
      setIsFadingOut(true);

      // After the fade-out animation completes, move to the next sentence
      const nextSentenceTimer = setTimeout(() => {
        setCurrentSentenceIndex(currentSentenceIndex + 1);
        setIsFadingOut(false);
      }, 1500); // Match the fadeOut animation duration in CSS

      return () => clearTimeout(nextSentenceTimer);
    }, duration);

    return () => clearTimeout(displayTimer);
  }, [currentSentenceIndex, sentences, duration]);

  // If we've shown all sentences, return null
  if (currentSentenceIndex >= sentences.length) {
    return null;
  }

  return (
    <div className="text-center w-full mx-auto">
      <p className={`text-sm md:text-base font-medium mb-2 animated-trust-text ${isFadingOut ? 'fade-out' : ''} mx-auto`}>
        {sentences[currentSentenceIndex]}
      </p>
    </div>
  );
};

export default AnimatedTrustText;
