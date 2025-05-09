import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, CalendarDays } from 'lucide-react';

interface CountdownCardProps {
  className?: string;
  exhibitionDate: Date;
  exhibitionTitle: string;
  exhibitionDescription?: string;
  maxAttendees?: number;
}

const CountdownCard: React.FC<CountdownCardProps> = ({
  className,
  exhibitionDate,
  exhibitionTitle,
  exhibitionDescription,
  maxAttendees = 250,
}) => {
  const [, setLocation] = useLocation();
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  useEffect(() => {
    // Function to calculate time remaining
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = exhibitionDate.getTime() - now.getTime();
      
      if (difference <= 0) {
        // Exhibition is now open
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      
      // Calculate time units
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds });
    };
    
    // Calculate immediately and then set up interval
    calculateTimeRemaining();
    const intervalId = setInterval(calculateTimeRemaining, 1000);
    
    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [exhibitionDate]);
  
  const handleViewExhibition = () => {
    setLocation('/art-exhibition');
  };
  
  const isExhibitionOpen = 
    timeRemaining.days === 0 && 
    timeRemaining.hours === 0 && 
    timeRemaining.minutes === 0 && 
    timeRemaining.seconds === 0;
    
  // Calculate progress towards exhibition (inverse of time remaining)
  const totalTimeInSeconds = 2 * 24 * 60 * 60; // 2 days, for example
  const remainingTimeInSeconds = 
    timeRemaining.days * 24 * 60 * 60 + 
    timeRemaining.hours * 60 * 60 + 
    timeRemaining.minutes * 60 + 
    timeRemaining.seconds;
  const progressPercentage = Math.min(
    100,
    Math.max(0, ((totalTimeInSeconds - remainingTimeInSeconds) / totalTimeInSeconds) * 100)
  );

  return (
    <Card className={`overflow-hidden border border-purple-200 ${className}`}>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-purple-900">{exhibitionTitle}</h3>
            
            {isExhibitionOpen ? (
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                Now Open
              </div>
            ) : (
              <div className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Coming Soon</span>
              </div>
            )}
          </div>
          
          {exhibitionDescription && (
            <p className="text-sm text-gray-600">{exhibitionDescription}</p>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="h-4 w-4 text-purple-700" />
            <span>Limited to {maxAttendees} attendees</span>
          </div>
          
          {!isExhibitionOpen && (
            <div className="bg-purple-50 rounded-lg p-3">
              <div className="flex justify-between text-center mb-2">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-purple-900">{timeRemaining.days}</div>
                  <div className="text-xs text-purple-700">Days</div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-purple-900">{timeRemaining.hours}</div>
                  <div className="text-xs text-purple-700">Hours</div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-purple-900">{timeRemaining.minutes}</div>
                  <div className="text-xs text-purple-700">Minutes</div>
                </div>
                <div className="flex-1">
                  <div className="text-2xl font-bold text-purple-900">{timeRemaining.seconds}</div>
                  <div className="text-xs text-purple-700">Seconds</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2 text-xs">
                <CalendarDays className="h-3 w-3 text-purple-700" />
                <span>Opening on {exhibitionDate.toLocaleDateString()} at {exhibitionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-purple-100" 
              />
            </div>
          )}
          
          <Button 
            className={isExhibitionOpen ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-300 hover:bg-gray-400"}
            onClick={handleViewExhibition}
          >
            {isExhibitionOpen ? 'Enter Exhibition' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountdownCard;