import React from 'react';
import { useWorkspace, WorkspaceItem } from './workspace-context';
import WorkspaceImage from './workspace-image';
import WorkspaceDocument from './workspace-document';
import WorkspaceNote from './workspace-note';
import { Button } from '@/components/ui/button';
import { Briefcase, X, Plus, Image, FileText, StickyNote, Eye, EyeOff, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const Workspace: React.FC = () => {
  const {
    items,
    isWorkspaceVisible,
    toggleWorkspaceVisibility,
    clearWorkspace,
    addItem
  } = useWorkspace();
  const { toast } = useToast();

  const handleAddImage = () => {
    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          addImageToWorkspace(imageUrl, file.name);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const addImageToWorkspace = (imageUrl: string, title: string = 'Image') => {
    addItem({
      type: 'image',
      content: imageUrl,
      title,
      position: { x: 100, y: 100 },
      size: { width: 200, height: 150 }
    });

    toast({
      title: "Image added to workspace",
      description: "You can now resize and move it anywhere on the page.",
    });
  };

  const handleAddDocument = () => {
    // Open file picker
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // For simplicity, we'll just store text files directly
        // In a real app, you'd want to handle different document types
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            addDocumentToWorkspace(content, file.name);
          };
          reader.readAsText(file);
        } else {
          // For other file types, just store a reference
          addDocumentToWorkspace(`File: ${file.name}`, file.name);
        }
      }
    };
    input.click();
  };

  const addDocumentToWorkspace = (content: string, title: string = 'Document') => {
    addItem({
      type: 'document',
      content,
      title,
      position: { x: 150, y: 150 },
      size: { width: 300, height: 200 }
    });

    toast({
      title: "Document added to workspace",
      description: "You can now resize and move it anywhere on the page.",
    });
  };

  const handleAddNote = () => {
    addItem({
      type: 'note',
      content: 'New note',
      title: 'Note',
      position: { x: 200, y: 200 },
      size: { width: 250, height: 150 }
    });

    toast({
      title: "Note added to workspace",
      description: "You can now edit, resize and move it anywhere on the page.",
    });
  };

  const handleClearWorkspace = () => {
    if (confirm('Are you sure you want to clear the workspace? This will remove all items.')) {
      clearWorkspace();
      toast({
        title: "Workspace cleared",
        description: "All items have been removed from the workspace.",
      });
    }
  };

  const renderWorkspaceItem = (item: WorkspaceItem) => {
    switch (item.type) {
      case 'image':
        return <WorkspaceImage key={item.id} item={item} />;
      case 'document':
        return <WorkspaceDocument key={item.id} item={item} />;
      case 'note':
        return <WorkspaceNote key={item.id} item={item} />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Workspace Controls */}
      <div className="fixed bottom-[15px] right-[20px] z-[1002] flex flex-col items-end space-y-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-[8px] bg-white dark:bg-gray-800 shadow-md h-10 w-10 border border-gray-300 dark:border-gray-600">
              <Briefcase className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleAddImage}>
              <Image className="mr-2 h-4 w-4" />
              <span>Add Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddDocument}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Add Document</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleAddNote}>
              <StickyNote className="mr-2 h-4 w-4" />
              <span>Add Note</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={toggleWorkspaceVisibility}>
              {isWorkspaceVisible ? (
                <>
                  <EyeOff className="mr-2 h-4 w-4" />
                  <span>Hide Workspace</span>
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Show Workspace</span>
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleClearWorkspace} className="text-red-500 focus:text-red-500">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Clear Workspace</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Workspace Items */}
      {isWorkspaceVisible && (
        <div className="workspace-items fixed inset-0 pointer-events-none z-[1000]">
          <div className="pointer-events-auto">
            {items.map(renderWorkspaceItem)}
          </div>
        </div>
      )}
    </>
  );
};

export default Workspace;
