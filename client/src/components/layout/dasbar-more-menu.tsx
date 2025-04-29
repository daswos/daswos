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

  if (moreItems.length === 0) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={`
            flex-1 py-2 mx-1 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors
            rounded-lg more-button
            ${className}
          `}
        >
          <div className="flex flex-col items-center justify-center">
            <div className="mb-1">
              <ChevronsRight className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">More</span>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
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

        {user && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigate('/dasbar-settings');
                setIsOpen(false);
              }}
              className="cursor-pointer"
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>Customize Dasbar</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DasbarMoreMenu;
