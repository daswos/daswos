import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Clock, CalendarDays, ArrowLeft, DollarSign, Award } from 'lucide-react';
import DasWosLogo from '@/components/daswos-logo';
import { useToast } from '@/hooks/use-toast';
import { Helmet } from 'react-helmet';

const ArtExhibitionPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isExhibitionOpen, setIsExhibitionOpen] = useState(false);
  const [position, setPosition] = useState(0); // Position in queue
  const [attendeeCount, setAttendeeCount] = useState(104); // Current number of attendees
  const maxAttendees = 250; // Maximum capacity
  const [isJoined, setIsJoined] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Mock exhibition date (2 days from now)
  const exhibitionDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

  // For demo purposes, this can be set to true to test different states
  const overrideOpen = false;

  // Sample artwork data
  const artworks = [
    {
      id: 1,
      title: "Sunset Dreams",
      artist: "Elena James",
      price: 1200,
      imageUrl: "https://placehold.co/600x400/f4d6ab/473c33?text=Sunset+Dreams",
      description: "A vibrant oil painting capturing the tranquil beauty of a sunset over the ocean.",
      bids: 8,
      highestBid: 1350
    },
    {
      id: 2,
      title: "Urban Fragments",
      artist: "Marcus Chen",
      price: 950,
      imageUrl: "https://placehold.co/600x400/c4bcf4/2b2347?text=Urban+Fragments",
      description: "A contemporary mixed media piece exploring the layers of city life through abstract forms.",
      bids: 3,
      highestBid: 975
    },
    {
      id: 3,
      title: "Serenity Garden",
      artist: "Olivia Patel",
      price: 1450,
      imageUrl: "https://placehold.co/600x400/c4f4d2/235734?text=Serenity+Garden",
      description: "An impressionist-style acrylic painting of a tranquil Japanese garden in spring bloom.",
      bids: 12,
      highestBid: 1800
    },
    {
      id: 4,
      title: "Geometric Harmony",
      artist: "Jacob Wilson",
      price: 890,
      imageUrl: "https://placehold.co/600x400/f4c4c4/562323?text=Geometric+Harmony",
      description: "A bold composition of geometric shapes and vibrant colors creating a sense of movement and balance.",
      bids: 5,
      highestBid: 925
    }
  ];

  useEffect(() => {
    // Function to calculate time remaining
    const calculateTimeRemaining = () => {
      const now = new Date();
      const difference = exhibitionDate.getTime() - now.getTime();

      if (difference <= 0 || overrideOpen) {
        // Exhibition is now open
        setIsExhibitionOpen(true);
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
  }, [exhibitionDate, overrideOpen]);

  const handleJoinQueue = () => {
    setIsJoined(true);
    // Simulate getting a position in the queue
    setPosition(Math.floor(Math.random() * 20) + 1); // Position between 1-20

    toast({
      title: "You've joined the queue!",
      description: `Your position is #${position}. We'll notify you when it's your turn.`,
      duration: 5000,
    });

    // Simulate queue advancement
    const queueTimer = setTimeout(() => {
      setPosition(0);
      setAttendeeCount(prev => prev + 1);
      toast({
        title: "It's your turn!",
        description: "You can now enter the art exhibition.",
        duration: 5000,
      });
    }, 8000); // 8 seconds for demo purposes

    return () => clearTimeout(queueTimer);
  };

  const handlePlaceBid = (artworkId: number) => {
    toast({
      title: "Bid Placed!",
      description: "Your bid has been recorded. You will be notified if you're outbid.",
      duration: 3000,
    });
  };

  const handleBuyNow = (artworkId: number) => {
    toast({
      title: "Purchase Started",
      description: "We're processing your purchase. Please complete the checkout process.",
      duration: 3000,
    });
  };

  const handleBackToCategories = () => {
    setLocation('/categories/art');
  };

  const attendeePercentage = (attendeeCount / maxAttendees) * 100;

  return (
    <>
      <Helmet>
        <title>Virtual Art Exhibition | Daswos</title>
        <meta name="description" content="Experience our exclusive virtual art exhibition featuring selected artists and unique pieces available for bidding." />
      </Helmet>
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm p-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <DasWosLogo size={36} className="mr-2" />
              <h1 className="text-xl font-bold">Virtual Art Exhibition</h1>
            </div>
            <Button
              variant="ghost"
              onClick={handleBackToCategories}
              className="flex items-center text-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Art
            </Button>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow container mx-auto py-6 px-4">
          {!isExhibitionOpen ? (
            // Exhibition countdown view
            <div className="max-w-3xl mx-auto">
              <Card className="overflow-hidden border border-purple-200">
                <CardHeader className="bg-purple-50">
                  <CardTitle className="text-center text-purple-900">Spring Art Exhibition 2025</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col space-y-6">
                    <p className="text-center text-gray-700">
                      Join our exclusive virtual art exhibition featuring selected artists and unique pieces available for viewing and bidding. The exhibition will open soon!
                    </p>

                    <div className="bg-purple-50 rounded-lg p-6">
                      <h3 className="text-center font-semibold text-purple-800 mb-4">Exhibition Opens In</h3>
                      <div className="flex justify-between text-center mb-4">
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-purple-900">{timeRemaining.days}</div>
                          <div className="text-sm text-purple-700">Days</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-purple-900">{timeRemaining.hours}</div>
                          <div className="text-sm text-purple-700">Hours</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-purple-900">{timeRemaining.minutes}</div>
                          <div className="text-sm text-purple-700">Minutes</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-purple-900">{timeRemaining.seconds}</div>
                          <div className="text-sm text-purple-700">Seconds</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3 justify-center text-sm">
                        <CalendarDays className="h-4 w-4 text-purple-700" />
                        <span>
                          Opening on {exhibitionDate.toLocaleDateString()} at {
                            exhibitionDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                          }
                        </span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-800 mb-2">Exhibition Details</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <Users className="h-4 w-4 text-blue-700" />
                          <span>Limited to {maxAttendees} concurrent attendees</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <Clock className="h-4 w-4 text-blue-700" />
                          <span>Duration: 3 days of exclusive access</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <Award className="h-4 w-4 text-blue-700" />
                          <span>Featured artists from around the world</span>
                        </li>
                        <li className="flex items-center gap-2 text-sm text-gray-700">
                          <DollarSign className="h-4 w-4 text-blue-700" />
                          <span>Bid on or purchase artwork directly</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-gray-50 flex justify-center p-4">
                  <Button variant="outline" disabled className="w-full md:w-auto">
                    Get Notified When Exhibition Opens
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            // Exhibition is open - show the gallery or queue
            <div className="max-w-6xl mx-auto">
              {/* Status bar */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="font-medium">Exhibition Open</span>
                    </div>

                    <div className="flex flex-col w-full md:w-1/3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Attendees</span>
                        <span>{attendeeCount} / {maxAttendees}</span>
                      </div>
                      <Progress value={attendeePercentage} className="h-2" />
                    </div>

                    {!isJoined && position === 0 && (
                      <Button onClick={handleJoinQueue} className="bg-purple-600 hover:bg-purple-700">
                        Join Exhibition
                      </Button>
                    )}

                    {isJoined && position > 0 && (
                      <div className="text-sm flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span>Queue position: #{position}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Queue waiting view */}
              {isJoined && position > 0 && (
                <Card className="text-center p-6 mb-6">
                  <h2 className="text-xl font-bold mb-2">You're in the Queue</h2>
                  <p className="mb-4">Please wait while we prepare your access to the exhibition.</p>
                  <div className="flex justify-center">
                    <div className="animate-pulse flex space-x-1">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <div className="h-2 w-2 bg-purple-500 rounded-full animation-delay-200"></div>
                      <div className="h-2 w-2 bg-purple-500 rounded-full animation-delay-400"></div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Exhibition content - shown when joined and no longer in queue */}
              {(!isJoined || position === 0) && (
                <>
                  <h2 className="text-2xl font-bold mb-4">Featured Artworks</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artworks.map((artwork) => (
                      <Card key={artwork.id} className="overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                          <img
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            className="object-cover w-full h-48"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-bold text-lg">{artwork.title}</h3>
                          <p className="text-sm text-gray-500 mb-2">by {artwork.artist}</p>
                          <p className="text-sm mb-4">{artwork.description}</p>
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="text-sm font-medium">Starting Price</div>
                              <div className="font-bold">${artwork.price}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">Current Bid</div>
                              <div className="font-bold text-purple-700">${artwork.highestBid}</div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 mb-3">
                            {artwork.bids} active bids
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => handlePlaceBid(artwork.id)}
                            >
                              Place Bid
                            </Button>
                            <Button
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                              onClick={() => handleBuyNow(artwork.id)}
                            >
                              Buy Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t p-4">
          <div className="container mx-auto text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Daswos Art Exhibitions. All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
};

export default ArtExhibitionPage;