import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Move } from 'lucide-react';

interface ResizableImageProps {
  src: string;
  alt: string;
  className?: string;
  initialWidth?: number | string;
  initialHeight?: number | string;
  initialX?: number;
  initialY?: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  preserveAspectRatio?: boolean;
  onResize?: (width: number, height: number) => void;
  onMove?: (x: number, y: number) => void;
}

const ResizableImage: React.FC<ResizableImageProps> = ({
  src,
  alt,
  className,
  initialWidth = 'auto',
  initialHeight = 'auto',
  initialX = 0,
  initialY = 0,
  minWidth = 50,
  minHeight = 50,
  maxWidth = 800,
  maxHeight = 600,
  preserveAspectRatio = true,
  onResize,
  onMove
}) => {
  const [width, setWidth] = useState<number | string>(initialWidth);
  const [height, setHeight] = useState<number | string>(initialHeight);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate and store aspect ratio when image loads
  const handleImageLoad = () => {
    if (imageRef.current) {
      const imgAspectRatio = imageRef.current.naturalWidth / imageRef.current.naturalHeight;
      setAspectRatio(imgAspectRatio);

      // Set initial dimensions if they're 'auto'
      if (initialWidth === 'auto' || initialHeight === 'auto') {
        setWidth(imageRef.current.naturalWidth);
        setHeight(imageRef.current.naturalHeight);
      }
    }
  };

  // Handle mouse down on resize handles
  const handleMouseDown = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeDirection(direction);
  };

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

  // Handle mouse move for resizing and dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle resizing
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        let newWidth = width as number;
        let newHeight = height as number;

        switch (resizeDirection) {
          case 'right':
            newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - containerRect.left));
            if (preserveAspectRatio) {
              newHeight = newWidth / aspectRatio;
            }
            break;
          case 'bottom':
            newHeight = Math.max(minHeight, Math.min(maxHeight, e.clientY - containerRect.top));
            if (preserveAspectRatio) {
              newWidth = newHeight * aspectRatio;
            }
            break;
          case 'corner':
            newWidth = Math.max(minWidth, Math.min(maxWidth, e.clientX - containerRect.left));
            if (preserveAspectRatio) {
              newHeight = newWidth / aspectRatio;
            } else {
              newHeight = Math.max(minHeight, Math.min(maxHeight, e.clientY - containerRect.top));
            }
            break;
          default:
            break;
        }

        setWidth(newWidth);
        setHeight(newHeight);

        if (onResize) {
          onResize(newWidth, newHeight);
        }
      }

      // Handle dragging - allow movement anywhere on the page
      if (isDragging) {
        // Get viewport dimensions
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = document.documentElement.clientHeight;

        // Calculate new position relative to the viewport
        const newX = Math.max(-50, Math.min(viewportWidth - 50, e.clientX - dragOffset.x));
        const newY = Math.max(-50, Math.min(viewportHeight - 50, e.clientY - dragOffset.y));

        setPosition({ x: newX, y: newY });

        if (onMove) {
          onMove(newX, newY);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setIsDragging(false);
      setResizeDirection(null);
    };

    if (isResizing || isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Change cursor during drag
      if (isDragging) {
        document.body.style.cursor = 'move';
      }
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isResizing, isDragging, resizeDirection, width, height, aspectRatio, minWidth, minHeight, maxWidth, maxHeight, preserveAspectRatio, onResize, onMove, dragOffset.x, dragOffset.y]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative inline-block group',
        (isResizing || isDragging) && 'select-none',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? 1000 : 100
      }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className="w-full h-full object-contain cursor-move"
        onLoad={handleImageLoad}
        onMouseDown={handleDragStart}
        draggable={false}
      />

      {/* Visual indicator for resizable image */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/30 pointer-events-none transition-colors duration-200"></div>

      {/* Drag handle */}
      <div
        className="absolute top-2 left-2 bg-white/80 dark:bg-gray-800/80 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-move"
        onMouseDown={handleDragStart}
      >
        <Move className="h-4 w-4 text-gray-700 dark:text-gray-300" />
      </div>

      {/* Right resize handle */}
      <div
        className="absolute top-0 right-0 w-2 h-full cursor-e-resize hover:bg-blue-500/20 group-hover:bg-blue-500/10"
        onMouseDown={(e) => handleMouseDown(e, 'right')}
      />

      {/* Bottom resize handle */}
      <div
        className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize hover:bg-blue-500/20 group-hover:bg-blue-500/10"
        onMouseDown={(e) => handleMouseDown(e, 'bottom')}
      />

      {/* Corner resize handle */}
      <div
        className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize group-hover:bg-blue-500/10"
        onMouseDown={(e) => handleMouseDown(e, 'corner')}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          className="absolute bottom-1 right-1 text-gray-500 group-hover:text-blue-500"
        >
          <path d="M12,12 L12,5 M5,12 L12,12" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default ResizableImage;
