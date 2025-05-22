import { useState } from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { RocketIcon, BrainCircuit } from 'lucide-react';

export function DaswosAiButton() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/daswos-ai">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <BrainCircuit className="h-5 w-5" />
              {isHovered && (
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75 -top-1 -right-1"></span>
              )}
            </Button>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="font-medium">Daswos AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}