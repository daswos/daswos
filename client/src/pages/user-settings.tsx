import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useDasbar, availableItems, NavigationItem } from '@/contexts/dasbar-context';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Grip, Plus, Trash2, Save, RotateCcw, Loader2 } from 'lucide-react';
import './user-settings.css';

const UserSettings = () => {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    items,
    addItem,
    removeItem,
    moveItem,
    resetToDefaults,
    updateDasbarItems,
    toggleCollapsedVisibility,
    savePreferences,
    isLoading
  } = useDasbar();

  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [dasbarItems, setDasbarItems] = useState<NavigationItem[]>(items);

  // Update local state when items from context change
  useEffect(() => {
    if (items.length > 0) {
      setDasbarItems(items);
      console.log("Items updated from context:", items);
    }
  }, [items]);

  // Track initial load
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // No timer needed anymore

  // Set initial load to false after component mounts
  useEffect(() => {
    if (isInitialLoad && items.length > 0) {
      setIsInitialLoad(false);
    }
  }, [items, isInitialLoad]);

  // We no longer need auto-save since the DasBar state is updated directly
  // and changes are reflected immediately in the UI

  // Filter out items that are already in the dasbar
  const availableToAdd = availableItems.filter(
    item => !dasbarItems.some(i => i.id === item.id)
  );

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Create a new array with the reordered items
    const reorderedItems = Array.from(dasbarItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    // First update the context directly - this is critical to prevent items from snapping back
    updateDasbarItems(reorderedItems);

    // Then update local state to match
    setDasbarItems(reorderedItems);

    // Save to server in the background
    savePreferences();

    toast({
      title: "Order updated",
      description: "Your DasBar items have been reordered.",
    });
  };

  const handleAddItem = () => {
    if (!selectedItem) return;

    const itemToAdd = availableItems.find(item => item.id === selectedItem);
    if (itemToAdd) {
      // Create a new array with the added item
      const updatedItems = [...dasbarItems, itemToAdd];

      // Update the context directly
      updateDasbarItems(updatedItems);

      // Update local state to match
      setDasbarItems(updatedItems);

      // Save to server in the background
      savePreferences();

      // Clear the selection
      setSelectedItem('');

      toast({
        title: "Item added",
        description: `${itemToAdd.label} has been added to your dasbar.`,
      });
    }
  };

  const handleRemoveItem = (id: string) => {
    const item = dasbarItems.find(i => i.id === id);
    if (item?.isDefault) {
      toast({
        title: "Cannot remove",
        description: "Default items cannot be removed from the dasbar.",
        variant: "destructive"
      });
      return;
    }

    // Create a new array without the removed item
    const updatedItems = dasbarItems.filter(item => item.id !== id);

    // Update the context directly
    updateDasbarItems(updatedItems);

    // Update local state to match
    setDasbarItems(updatedItems);

    // Save to server in the background
    savePreferences();

    toast({
      title: "Item removed",
      description: "The item has been removed from your dasbar.",
    });
  };

  const handleReset = () => {
    const defaultItemsArray = availableItems.filter(item => item.isDefault);

    // Update the context directly
    updateDasbarItems(defaultItemsArray);

    // Update local state to match
    setDasbarItems(defaultItemsArray);

    // No need to reset max visible items anymore

    // Save to server in the background
    savePreferences();

    toast({
      title: "Reset complete",
      description: "Your dasbar has been reset to default settings.",
    });
  };

  const handleSave = async () => {
    // Don't show saving indicator for automatic saves
    setIsSaving(true);

    try {
      // Create a new array with the exact order we want in the context
      const updatedItems = [...dasbarItems];

      // Update the context directly with our new array
      // This is much more efficient than the previous approach
      updateDasbarItems(updatedItems);

      // Save to server
      await savePreferences();

      // No need to show toast for automatic saves
    } catch (error) {
      console.error('Error updating dasbar:', error);
      // Only show error toasts
      toast({
        title: "Error updating DasBar",
        description: "There was a problem updating your DasBar.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="user-settings-container">
        <Card className="user-settings-card">
          <CardHeader>
            <CardTitle>User Settings</CardTitle>
            <CardDescription>Please log in to access your settings.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="user-settings-container">
      <h1 className="text-2xl font-bold mb-6">User Settings</h1>

      <Card className="user-settings-card">
        <CardHeader>
          <CardTitle>DasBar Settings</CardTitle>
          <CardDescription>Customize your DasBar navigation</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-6">


              <div className="settings-section">
                <Label className="text-base mb-2 block">Arrange DasBar Items</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Drag and drop to reorder items in your Dasbar.
                </p>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="dasbar-items">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-2 mb-4"
                      >
                        {dasbarItems.map((item, index) => {
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className="flex items-center justify-between p-3 rounded-md border bg-white dark:bg-gray-800"
                                >
                                  <div className="flex items-center space-x-3">
                                    <div {...provided.dragHandleProps} className="drag-handle">
                                      <Grip className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <span>
                                      {item.label}
                                    </span>
                                    {item.isDefault && (
                                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleRemoveItem(item.id)}
                                    disabled={item.isDefault}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4 text-gray-500" />
                                  </Button>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                {availableToAdd.length > 0 && (
                  <div className="flex items-end space-x-2 mt-4">
                    <div className="flex-1">
                      <Label htmlFor="add-item" className="text-sm mb-1 block">Add Item</Label>
                      <select
                        id="add-item"
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="">Select an item to add...</option>
                        {availableToAdd.map(item => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      onClick={handleAddItem}
                      disabled={!selectedItem}
                      className="h-10"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div className="settings-section">
                <Label className="text-base mb-2 block">Collapsed Mode Quick Access</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Select which buttons should be visible next to the collapsed 'D' button for quick access without expanding the Dasbar.
                </p>

                <div className="space-y-3">
                  {dasbarItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-md border bg-white dark:bg-gray-800">
                      <div className="flex items-center space-x-3">
                        <span>{item.label}</span>
                        {item.showInCollapsed && (
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-0.5 rounded">
                            Quick Access
                          </span>
                        )}
                      </div>
                      <Button
                        variant={item.showInCollapsed ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          // Call the context function
                          toggleCollapsedVisibility(item.id);

                          // Update local state to reflect the change
                          const newShowInCollapsed = !item.showInCollapsed;
                          setDasbarItems(prevItems =>
                            prevItems.map(prevItem =>
                              prevItem.id === item.id
                                ? { ...prevItem, showInCollapsed: newShowInCollapsed }
                                : prevItem
                            )
                          );

                          // Log for debugging
                          console.log(`Toggled ${item.id} to showInCollapsed: ${newShowInCollapsed}`);

                          // Show feedback to the user
                          toast({
                            title: item.showInCollapsed
                              ? `Removed ${item.label} from quick access`
                              : `Added ${item.label} to quick access`,
                            description: item.showInCollapsed
                              ? `${item.label} will no longer appear in collapsed mode`
                              : `${item.label} will now appear next to the D button in collapsed mode`,
                          });

                          // Force save to ensure changes are persisted
                          setTimeout(() => {
                            savePreferences();
                          }, 100);
                        }}
                        className="h-8"
                      >
                        {item.showInCollapsed ? "Remove" : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSettings;
