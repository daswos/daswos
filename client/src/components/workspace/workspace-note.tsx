import React, { useState, useRef } from 'react';
import { WorkspaceItem, useWorkspace } from './workspace-context';
import { X, Move, Maximize2, Minimize2, StickyNote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface WorkspaceNoteProps {
  item: WorkspaceItem;
}

const WorkspaceNote: React.FC<WorkspaceNoteProps> = ({ item }) => {
  const { updateItem, removeItem } = useWorkspace();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(item.content);

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

  // Handle mouse down on resize handles
  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
  };

  // Handle mouse move for dragging and resizing
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Handle dragging
      if (isDragging) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        
        updateItem(item.id, {
          position: { x: newX, y: newY }
        });
      }
      
      // Handle resizing
      if (isResizing && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        let newWidth = item.size.width;
        let newHeight = item.size.height;

        switch (resizeDirection) {
          case 'right':
            newWidth = Math.max(100, e.clientX - rect.left);
            break;
          case 'bottom':
            newHeight = Math.max(100, e.clientY - rect.top);
            break;
          case 'corner':
            newWidth = Math.max(100, e.clientX - rect.left);
            newHeight = Math.max(100, e.clientY - rect.top);
            break;
          default:
            break;
        }

        updateItem(item.id, {
          size: { width: newWidth, height: newHeight }
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setResizeDirection(null);
    };

    if (isDragging || isResizing) {
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
  }, [isDragging, isResizing, resizeDirection, dragOffset, item.id, updateItem]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNoteContent(e.target.value);
  };

  const handleContentBlur = () => {
    updateItem(item.id, { content: noteContent });
    setIsEditing(false);
  };

  const handleContentClick = () => {
    setIsEditing(true);
  };

  return (
    <div
      ref={containerRef}
      className={`workspace-item ${isDragging || isResizing ? 'select-none' : ''} group`}
      style={{
        position: 'fixed',
        left: `${item.position.x}px`,
        top: `${item.position.y}px`,
        width: isFullscreen ? '80vw' : `${item.size.width}px`,
        height: isFullscreen ? '80vh' : `${item.size.height}px`,
        zIndex: isDragging || isResizing ? 1000 : 100,
        backgroundColor: '#ffffa0', // Yellow sticky note color
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.1)',
        transition: isFullscreen ? 'all 0.3s ease' : 'none'
      }}
    >
      {/* Header */}
      <div 
        className="p-2 bg-yellow-200 dark:bg-yellow-300 flex items-center justify-between cursor-move"
        onMouseDown={handleDragStart}
      >
        <div className="text-sm font-medium truncate flex items-center text-black">
          <StickyNote className="h-4 w-4 mr-1" />
          {item.title || 'Note'}
        </div>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-black hover:text-gray-700" 
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-red-500 hover:text-red-700" 
            onClick={() => removeItem(item.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 h-[calc(100%-32px)] overflow-auto">
        {isEditing ? (
          <Textarea
            value={noteContent}
            onChange={handleContentChange}
            onBlur={handleContentBlur}
            className="w-full h-full bg-transparent border-none focus:ring-0 resize-none text-black"
            autoFocus
          />
        ) : (
          <div 
            className="whitespace-pre-wrap text-sm text-black cursor-text h-full"
            onClick={handleContentClick}
          >
            {noteContent}
          </div>
        )}
      </div>

      {/* Resize handles (only visible when not in fullscreen) */}
      {!isFullscreen && (
        <>
          <div 
            className="absolute top-0 right-0 w-2 h-full cursor-e-resize hover:bg-yellow-400/20 group-hover:bg-yellow-400/10"
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          <div 
            className="absolute bottom-0 left-0 w-full h-2 cursor-s-resize hover:bg-yellow-400/20 group-hover:bg-yellow-400/10"
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
          <div 
            className="absolute bottom-0 right-0 w-8 h-8 cursor-se-resize group-hover:bg-yellow-400/10"
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 14 14" 
              className="absolute bottom-1 right-1 text-yellow-700 group-hover:text-yellow-800"
            >
              <path d="M12,12 L12,5 M5,12 L12,12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkspaceNote;
