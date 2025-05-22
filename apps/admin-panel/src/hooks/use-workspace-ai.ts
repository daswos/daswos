import { useWorkspace, WorkspaceItem } from '@/components/workspace/workspace-context';

// This hook provides access to workspace content for AI integration
export function useWorkspaceAI() {
  const { items, isWorkspaceVisible } = useWorkspace();

  // Get all workspace content as a formatted string for AI context
  const getWorkspaceContentForAI = (): string => {
    if (!isWorkspaceVisible || items.length === 0) {
      return '';
    }

    const contentParts = items.map(formatItemForAI);
    return `
===== WORKSPACE CONTENT =====
The user has the following items in their workspace:

${contentParts.join('\n\n')}
===== END WORKSPACE CONTENT =====
`;
  };

  // Format a single workspace item for AI consumption
  const formatItemForAI = (item: WorkspaceItem): string => {
    switch (item.type) {
      case 'image':
        return `[IMAGE] ${item.title || 'Untitled Image'}: An image is present in the workspace.`;
      
      case 'document':
        return `[DOCUMENT] ${item.title || 'Untitled Document'}:\n${item.content}`;
      
      case 'note':
        return `[NOTE] ${item.title || 'Untitled Note'}:\n${item.content}`;
      
      default:
        return `[UNKNOWN ITEM] ${item.title || 'Untitled Item'}`;
    }
  };

  // Get a specific item's content by ID
  const getItemContentById = (id: string): string | null => {
    const item = items.find(item => item.id === id);
    if (!item) return null;
    
    return formatItemForAI(item);
  };

  // Check if there are any items in the workspace
  const hasWorkspaceItems = (): boolean => {
    return items.length > 0 && isWorkspaceVisible;
  };

  return {
    getWorkspaceContentForAI,
    getItemContentById,
    hasWorkspaceItems,
    workspaceItemCount: items.length
  };
}
