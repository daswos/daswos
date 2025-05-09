import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronRight, Settings, ChevronsRight } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDasbar, NavigationItem } from '@/contexts/dasbar-context';
import { useAuth } from '@/hooks/use-auth';

interface DasbarMoreMenuProps {
  className?: string;
}

const DasbarMoreMenu: React.FC<DasbarMoreMenuProps> = ({ className = '' }) => {
  const [location, navigate] = useLocation();
  const { moreItems } = useDasbar();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Check if the current path matches the item path
  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  // Always show the More button, even if there are no additional items
  // This ensures the More button is always visible in the DasBar

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            text-black dark:text-white transition-colors more-button
            ${className}
          `}
          aria-label="More options"
        >
          <ChevronsRight className="h-5 w-5" />
          <span>More</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {/* Show more items if available */}
        {moreItems.length > 0 && (
          <>
            {moreItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <DropdownMenuItem
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`
                    cursor-pointer
                    ${isActive(item.path) ? 'bg-gray-100 dark:bg-gray-800' : ''}
                  `}
                >
                  <div className="flex items-center">
                    {IconComponent && <IconComponent className="h-5 w-5 mr-2" />}
                    <span>{item.label}</span>
                  </div>
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Always show the Customize DasBar option for logged-in users */}
        {user && (
          <DropdownMenuItem
            onClick={() => {
              navigate('/user-settings');
              setIsOpen(false);
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              <span>Customize Dasbar</span>
            </div>
          </DropdownMenuItem>
        )}


      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DasbarMoreMenu;
