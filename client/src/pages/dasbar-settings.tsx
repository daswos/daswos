import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Plus, Trash2, Save, RotateCcw, Grip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useDasbar, availableItems, NavigationItem } from '@/contexts/dasbar-context';
import { useAuth } from '@/hooks/use-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

const DasbarSettings = () => {
  const [, navigate] = useLocation();
  const {
    items,
    addItem,
    removeItem,
    moveItem,
    resetToDefaults,
    maxVisibleItems,
    setMaxVisibleItems,
    savePreferences,
    isLoading
  } = useDasbar();

  const [selectedItem, setSelectedItem] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [dasbarItems, setDasbarItems] = useState<NavigationItem[]>(items);
  const { user } = useAuth();

  // Update local state when items from context change
  useEffect(() => {
    setDasbarItems(items);
  }, [items]);

  // Filter out items that are already in the dasbar
  const availableToAdd = availableItems.filter(
    item => !dasbarItems.some(i => i.id === item.id)
  );

  // Handle drag and drop reordering
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const reorderedItems = Array.from(dasbarItems);
    const [movedItem] = reorderedItems.splice(result.source.index, 1);
    reorderedItems.splice(result.destination.index, 0, movedItem);

    setDasbarItems(reorderedItems);
  };

  const handleAddItem = () => {
    if (!selectedItem) return;

    const itemToAdd = availableItems.find(item => item.id === selectedItem);
    if (itemToAdd) {
      setDasbarItems([...dasbarItems, itemToAdd]);
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

    // Remove from local state
    setDasbarItems(dasbarItems.filter(item => item.id !== id));

    // Also remove from context so it appears in the available items immediately
    removeItem(id);

    toast({
      title: "Item removed",
      description: "The item has been removed from your dasbar.",
    });
  };

  const handleReset = () => {
    const defaultItemsArray = availableItems.filter(item => item.isDefault);
    setDasbarItems(defaultItemsArray);
    toast({
      title: "Reset complete",
      description: "Your dasbar has been reset to default settings.",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update the context with our local state before saving
      dasbarItems.forEach((item, index) => {
        // First make sure all items are in the context
        if (!items.some(i => i.id === item.id)) {
          addItem(item);
        }

        // Then ensure the order is correct
        const contextIndex = items.findIndex(i => i.id === item.id);
        if (contextIndex !== index && contextIndex !== -1) {
          // Move the item to the correct position
          if (contextIndex > index) {
            // Need to move up
            for (let i = 0; i < contextIndex - index; i++) {
              moveItem(item.id, 'up');
            }
          } else {
            // Need to move down
            for (let i = 0; i < index - contextIndex; i++) {
              moveItem(item.id, 'down');
            }
          }
        }
      });

      // Remove any items that are in the context but not in our local state
      items.forEach(item => {
        if (!dasbarItems.some(i => i.id === item.id) && !item.isDefault) {
          removeItem(item.id);
        }
      });

      await savePreferences();
      toast({
        title: "Settings saved",
        description: "Your dasbar preferences have been saved.",
      });
      // Navigate to home page after successful save
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error saving settings",
        description: "There was a problem saving your dasbar preferences.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center w-full py-8">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="flex items-center mb-6">

            <h1 className="text-2xl font-bold">Customize Dasbar</h1>
          </div>
          <Card>
            <CardContent className="py-8">
              <div className="flex justify-center items-center">
                <p>Loading navigation settings...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full py-8">
      <div className="container max-w-3xl mx-auto px-4">
        <div className="flex items-center mb-6">

          <h1 className="text-2xl font-bold">Customize Dasbar</h1>
        </div>

      {/* Dasbar Preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dasbar Preview</CardTitle>
          <CardDescription>
            This is how your dasbar will look.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border border-gray-400 dark:border-gray-600 flex justify-center bg-gray-200 dark:bg-gray-800 rounded-lg p-2">
            <div className="w-full max-w-xl flex text-sm justify-around">
              {dasbarItems.slice(0, maxVisibleItems).map((item) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex-1 py-2 mx-1 text-black dark:text-white bg-gray-300 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <div className="mb-1">
                        {IconComponent && <IconComponent className="h-5 w-5" />}
                      </div>
                      <span className="text-xs font-medium">{item.label}</span>
                    </div>
                  </div>
                );
              })}

              {/* More button preview */}
              {dasbarItems.length > maxVisibleItems && (
                <div className="flex-1 py-2 mx-1 text-black dark:text-white bg-gray-300 dark:bg-gray-700 rounded-lg">
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-1">
                      <Plus className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">More</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dasbar Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Dasbar Items</CardTitle>
          <CardDescription>
            Drag and drop to reorder items or remove them from your dasbar.
            Only Home and das.list (marked with "Default") cannot be removed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="dasbar-items">
              {(provided) => (
                <div
                  className="space-y-2"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {dasbarItems.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center justify-between p-3 rounded-md ${
                            snapshot.isDragging
                              ? 'bg-gray-200 dark:bg-gray-700 shadow-lg'
                              : 'bg-gray-100 dark:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              {...provided.dragHandleProps}
                              className="mr-2 cursor-grab active:cursor-grabbing"
                            >
                              <Grip className="h-5 w-5 text-gray-500" />
                            </div>
                            {item.icon && React.createElement(item.icon, { className: "h-5 w-5 mr-3" })}
                            <span>{item.label}</span>
                            {item.isDefault && (
                              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(Default)</span>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={item.isDefault}
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {dasbarItems.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No items in your dasbar. Add some below.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add New Item</CardTitle>
          <CardDescription>
            Add more navigation items to your dasbar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableToAdd.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              All available items have been added to your dasbar.
            </div>
          ) : (
            <>
              <Label className="mb-2 block">Available Items</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                {availableToAdd.map(item => {
                  const IconComponent = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        // Add the item to both the local state and the context
                        const updatedItems = [...dasbarItems, item];
                        setDasbarItems(updatedItems);

                        // Also add to the context so it's immediately available
                        addItem(item);

                        // Show success toast
                        toast({
                          title: "Item added",
                          description: `${item.label} has been added to your dasbar.`,
                        });
                      }}
                      className="flex items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center">
                        {IconComponent && React.createElement(IconComponent, { className: "h-5 w-5 mr-3" })}
                        <span>{item.label}</span>
                      </div>
                      <Plus className="h-4 w-4 ml-auto" />
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Configure how many items to show directly in the dasbar (up to 10).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="max-visible">Maximum visible items: {maxVisibleItems}</Label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={maxVisibleItems}
                  onChange={(e) => setMaxVisibleItems(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <span className="text-sm font-medium">{maxVisibleItems}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Additional items will appear in the "More" dropdown.
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-2">Preview:</h3>
              <div className="flex flex-wrap gap-2">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    onClick={() => setMaxVisibleItems(i + 1)}
                    className={`
                      w-12 h-12 rounded-md flex items-center justify-center cursor-pointer
                      ${i < maxVisibleItems
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
                      hover:opacity-80 transition-opacity
                    `}
                  >
                    {i + 1}
                  </div>
                ))}

                {/* More button preview */}
                <div
                  className="w-12 h-12 rounded-md flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  More
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default DasbarSettings;
