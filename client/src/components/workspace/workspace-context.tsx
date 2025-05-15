import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types for workspace items
export type WorkspaceItemType = 'image' | 'document' | 'note';

export interface WorkspaceItem {
  id: string;
  type: WorkspaceItemType;
  content: string;
  title?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  createdAt: Date;
  updatedAt: Date;
}

interface WorkspaceContextType {
  items: WorkspaceItem[];
  addItem: (item: Omit<WorkspaceItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, updates: Partial<Omit<WorkspaceItem, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  removeItem: (id: string) => void;
  getItemById: (id: string) => WorkspaceItem | undefined;
  isWorkspaceVisible: boolean;
  toggleWorkspaceVisibility: () => void;
  clearWorkspace: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

interface WorkspaceProviderProps {
  children: ReactNode;
}

export const WorkspaceProvider: React.FC<WorkspaceProviderProps> = ({ children }) => {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [isWorkspaceVisible, setIsWorkspaceVisible] = useState(true);

  // Load workspace items from localStorage on mount
  useEffect(() => {
    const savedItems = localStorage.getItem('daswos-workspace-items');
    if (savedItems) {
      try {
        const parsedItems = JSON.parse(savedItems);
        // Convert string dates back to Date objects
        const itemsWithDates = parsedItems.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        }));
        setItems(itemsWithDates);
      } catch (error) {
        console.error('Failed to parse workspace items from localStorage:', error);
      }
    }

    const savedVisibility = localStorage.getItem('daswos-workspace-visible');
    if (savedVisibility !== null) {
      setIsWorkspaceVisible(savedVisibility === 'true');
    }
  }, []);

  // Save workspace items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('daswos-workspace-items', JSON.stringify(items));
  }, [items]);

  // Save workspace visibility to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('daswos-workspace-visible', isWorkspaceVisible.toString());
  }, [isWorkspaceVisible]);

  const addItem = (item: Omit<WorkspaceItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date();
    const newItem: WorkspaceItem = {
      ...item,
      id: `workspace-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };
    setItems(prevItems => [...prevItems, newItem]);
  };

  const updateItem = (id: string, updates: Partial<Omit<WorkspaceItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, ...updates, updatedAt: new Date() } 
          : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const getItemById = (id: string) => {
    return items.find(item => item.id === id);
  };

  const toggleWorkspaceVisibility = () => {
    setIsWorkspaceVisible(prev => !prev);
  };

  const clearWorkspace = () => {
    setItems([]);
  };

  const value = {
    items,
    addItem,
    updateItem,
    removeItem,
    getItemById,
    isWorkspaceVisible,
    toggleWorkspaceVisibility,
    clearWorkspace
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
