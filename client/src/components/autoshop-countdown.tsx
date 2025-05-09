import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AutoShopCountdownProps {
  endTime: Date;
  onComplete: () => void;
  className?: string;
}

const AutoShopCountdown: React.FC<AutoShopCountdownProps> = ({
  endTime,
  onComplete,
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    progress: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    progress: 100
  });
  
  const [initialTotalSeconds, setInitialTotalSeconds] = useState<number>(0);
  
  useEffect(() => {
    // Calculate initial total seconds for progress calculation
    const now = new Date();
    const diffMs = endTime.getTime() - now.getTime();
    const initialSeconds = Math.max(0, Math.floor(diffMs / 1000));
    setInitialTotalSeconds(initialSeconds);
    
    const calculateTimeLeft = () => {
      const now = new Date();
      const diffMs = endTime.getTime() - now.getTime();
      
      if (diffMs <= 0) {
        // Time's up
        onComplete();
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          progress: 0
        };
      }
      
      // Calculate time components
      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (60 * 60 * 24));
      const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = Math.floor(totalSeconds % 60);
      
      // Calculate progress percentage (inverted: 100% at start, 0% at end)
      const progress = initialSeconds > 0 
        ? Math.max(0, Math.min(100, (totalSeconds / initialSeconds) * 100)) 
        : 0;
      
      return {
        days,
        hours,
        minutes,
        seconds,
        totalSeconds,
        progress
      };
    };
    
    // Initial calculation
    setTimeLeft(calculateTimeLeft());
    
    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft.totalSeconds <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    // Cleanup
    return () => clearInterval(timer);
  }, [endTime, onComplete, initialTotalSeconds]);
  
  // Format time component with leading zero
  const formatTimeComponent = (value: number): string => {
    return value < 10 ? `0${value}` : `${value}`;
  };
  
  // Format the countdown display
  const formatCountdown = (): string => {
    if (timeLeft.days > 0) {
      return `${timeLeft.days}d ${formatTimeComponent(timeLeft.hours)}h ${formatTimeComponent(timeLeft.minutes)}m`;
    } else if (timeLeft.hours > 0) {
      return `${formatTimeComponent(timeLeft.hours)}:${formatTimeComponent(timeLeft.minutes)}:${formatTimeComponent(timeLeft.seconds)}`;
    } else {
      return `${formatTimeComponent(timeLeft.minutes)}:${formatTimeComponent(timeLeft.seconds)}`;
    }
  };
  
  return (
    <div className={`${className}`}>
      <Alert variant="default" className="bg-primary/5 border-primary/20">
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1 text-sm font-medium">
              <Clock className="h-4 w-4 text-primary" />
              <span>AutoShop Active</span>
            </div>
            <span className="text-sm font-mono">{formatCountdown()}</span>
          </div>
          <Progress value={timeLeft.progress} className="h-1.5" />
          <AlertDescription className="mt-1 text-xs text-muted-foreground">
            {timeLeft.totalSeconds > 0 
              ? "AI is actively shopping based on your preferences" 
              : "AutoShop session has ended"}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};

export default AutoShopCountdown;
