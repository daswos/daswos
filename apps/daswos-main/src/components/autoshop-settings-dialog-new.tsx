import React, { useState, useEffect } from 'react';
import {
  TransparentDialog as Dialog,
  TransparentDialogContent as DialogContent,
  TransparentDialogHeader as DialogHeader,
  TransparentDialogTitle as DialogTitle,
  TransparentDialogClose as DialogClose
} from "@/components/ui/transparent-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Coins, Clock, Tag, X, Save } from 'lucide-react';
import { AutoShopSettings, useAutoShop } from '@/contexts/autoshop-context';

interface AutoShopSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: AutoShopSettings) => void;
  userCoins: number;
}

// Available shopping categories
const AVAILABLE_CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Beauty & Personal Care',
  'Sports & Outdoors',
  'Toys & Games',
  'Books & Media',
  'Automotive',
  'Health & Wellness',
  'Office Supplies'
];

const DEFAULT_SETTINGS: AutoShopSettings = {
  maxTotalCoins: 5000,
  minItemPrice: 50,  // 50 dollars
  maxItemPrice: 250, // 250 dollars
  duration: {
    value: 30,
    unit: 'minutes'
  },
  categories: ['Electronics', 'Sports & Outdoors', 'Fashion'],
  customPrompt: '',
  useRandomMode: false
};

const AutoShopSettingsDialogNew: React.FC<AutoShopSettingsDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  userCoins
}) => {
  const [settings, setSettings] = useState<AutoShopSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('budget');
  const [shoppingMethod, setShoppingMethod] = useState<'categories' | 'prompt' | 'random'>('categories');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['Electronics']);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Reset settings when dialog opens
  useEffect(() => {
    if (open) {
      // Load saved settings from localStorage if available
      const savedSettings = localStorage.getItem('daswos-autoshop-settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(parsedSettings);

          if (parsedSettings.useRandomMode) {
            setShoppingMethod('random');
          } else if (parsedSettings.customPrompt && parsedSettings.customPrompt.trim() !== '') {
            setShoppingMethod('prompt');
          } else {
            setShoppingMethod('categories');
          }

          setSelectedCategories(parsedSettings.categories || ['Electronics']);
        } catch (e) {
          console.error('Error parsing saved settings:', e);
        }
      }
    }
  }, [open]);

  // Handle shopping method change
  const handleShoppingMethodChange = (value: 'categories' | 'prompt' | 'random') => {
    setShoppingMethod(value);

    // Update settings based on the selected method
    if (value === 'random') {
      setSettings(prev => ({
        ...prev,
        useRandomMode: true,
        customPrompt: '',
      }));
    } else if (value === 'prompt') {
      setSettings(prev => ({
        ...prev,
        useRandomMode: false,
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        useRandomMode: false,
        customPrompt: '',
      }));
    }
  };

  // Handle category selection
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => {
      const isSelected = prev.includes(category);

      if (isSelected) {
        // Don't allow deselecting the last category
        if (prev.length === 1) return prev;
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Update settings with selected categories
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      categories: selectedCategories,
    }));
  }, [selectedCategories]);

  // Validate budget settings
  const validateBudgetSettings = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!settings.maxTotalCoins || settings.maxTotalCoins <= 0) {
      newErrors.maxTotalCoins = 'Please enter a valid maximum total coins amount';
    }

    if (!settings.minItemPrice || settings.minItemPrice <= 0) {
      newErrors.minItemPrice = 'Please enter a valid minimum item price';
    }

    if (!settings.maxItemPrice || settings.maxItemPrice <= 0) {
      newErrors.maxItemPrice = 'Please enter a valid maximum item price';
    }

    if (settings.minItemPrice >= settings.maxItemPrice) {
      newErrors.priceRange = 'Minimum price must be less than maximum price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate time settings
  const validateTimeSettings = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!settings.duration.value || settings.duration.value <= 0) {
      newErrors.duration = 'Please enter a valid duration';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate preferences settings
  const validatePreferencesSettings = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (shoppingMethod === 'categories' && (!selectedCategories || selectedCategories.length === 0)) {
      newErrors.categories = 'Please select at least one category';
    } else if (shoppingMethod === 'prompt' && (!settings.customPrompt || settings.customPrompt.trim() === '')) {
      newErrors.customPrompt = 'Please enter a shopping prompt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigate to next tab
  const handleNext = () => {
    if (activeTab === 'budget') {
      if (validateBudgetSettings()) {
        setActiveTab('time');
      }
    } else if (activeTab === 'time') {
      if (validateTimeSettings()) {
        setActiveTab('preferences');
      }
    }
  };

  // Handle start button click
  const handleStart = () => {
    if (validatePreferencesSettings()) {
      // Save settings to localStorage
      localStorage.setItem('daswos-autoshop-settings', JSON.stringify(settings));
      onSave(settings);
    }
  };

  // Handle back button
  const handleBack = () => {
    if (activeTab === 'time') {
      setActiveTab('budget');
    } else if (activeTab === 'preferences') {
      setActiveTab('time');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-lg">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle className="flex items-center justify-center gap-2 text-xl">
            <ShoppingBag className="h-6 w-6" />
            DasWos AutoShop
          </DialogTitle>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Configure how the AI will shop for you. Your available balance:
            <span className="font-semibold ml-1 flex items-center gap-1 inline-flex">
              <Coins className="h-4 w-4" /> {userCoins.toLocaleString()} coins
            </span>
          </p>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 rounded-none border-b border-gray-200 dark:border-gray-700 bg-transparent p-0">
            <TabsTrigger
              value="budget"
              className="flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none bg-transparent"
            >
              <Coins className="h-5 w-5" /> Budget
            </TabsTrigger>
            <TabsTrigger
              value="time"
              className="flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none bg-transparent"
            >
              <Clock className="h-5 w-5" /> Time
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="flex items-center gap-2 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:shadow-none bg-transparent"
            >
              <Tag className="h-5 w-5" /> Preferences
            </TabsTrigger>
          </TabsList>

          <TabsContent value="budget" className="p-6 pt-4 bg-transparent">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Budget Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="max-total-coins" className="text-sm font-medium mb-1 block">
                      Maximum total coins to spend
                    </Label>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-gray-500" />
                      <input
                        id="max-total-coins"
                        type="number"
                        min={100}
                        max={userCoins}
                        value={settings.maxTotalCoins}
                        onChange={(e) => setSettings({
                          ...settings,
                          maxTotalCoins: Math.min(parseInt(e.target.value) || 100, userCoins)
                        })}
                        className={`w-full rounded-md border p-2 text-sm bg-white/70 backdrop-blur-sm ${errors.maxTotalCoins ? 'border-red-500' : 'border-gray-300'}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum {userCoins.toLocaleString()} coins available
                    </p>
                    {errors.maxTotalCoins && (
                      <p className="text-xs text-red-500 mt-1">{errors.maxTotalCoins}</p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-1 block">
                      Price range per item (in dollars)
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min-item-price" className="text-xs text-gray-500 mb-1 block">
                          Minimum ($)
                        </Label>
                        <input
                          id="min-item-price"
                          type="number"
                          min={1}
                          max={settings.maxItemPrice - 1}
                          value={settings.minItemPrice}
                          onChange={(e) => setSettings({
                            ...settings,
                            minItemPrice: Math.min(parseInt(e.target.value) || 1, settings.maxItemPrice - 1)
                          })}
                          className={`w-full rounded-md border p-2 text-sm bg-white/70 backdrop-blur-sm ${errors.minItemPrice ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.minItemPrice && (
                          <p className="text-xs text-red-500 mt-1">{errors.minItemPrice}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="max-item-price" className="text-xs text-gray-500 mb-1 block">
                          Maximum ($)
                        </Label>
                        <input
                          id="max-item-price"
                          type="number"
                          min={settings.minItemPrice + 1}
                          max={settings.maxTotalCoins}
                          value={settings.maxItemPrice}
                          onChange={(e) => setSettings({
                            ...settings,
                            maxItemPrice: Math.max(parseInt(e.target.value) || settings.minItemPrice + 1, settings.minItemPrice + 1)
                          })}
                          className={`w-full rounded-md border p-2 text-sm bg-white/70 backdrop-blur-sm ${errors.maxItemPrice ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.maxItemPrice && (
                          <p className="text-xs text-red-500 mt-1">{errors.maxItemPrice}</p>
                        )}
                      </div>
                    </div>
                    {errors.priceRange && (
                      <p className="text-xs text-red-500 mt-1">{errors.priceRange}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="time" className="p-6 pt-4 bg-transparent">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Time Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="duration-value" className="text-sm font-medium mb-1 block">
                      Shopping duration
                    </Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div className="flex items-center gap-2 w-full">
                        <input
                          id="duration-value"
                          type="number"
                          min={1}
                          max={60}
                          value={settings.duration.value}
                          onChange={(e) => setSettings({
                            ...settings,
                            duration: {
                              ...settings.duration,
                              value: parseInt(e.target.value) || 1
                            }
                          })}
                          className={`w-full rounded-md border p-2 text-sm bg-white/70 backdrop-blur-sm ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <select
                          value={settings.duration.unit}
                          onChange={(e) => setSettings({
                            ...settings,
                            duration: {
                              ...settings.duration,
                              unit: e.target.value as 'minutes' | 'hours' | 'days'
                            }
                          })}
                          className="rounded-md border border-gray-300 p-2 text-sm bg-white/70 backdrop-blur-sm"
                        >
                          <option value="minutes">Minutes</option>
                          <option value="hours">Hours</option>
                          <option value="days">Days</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      The AI will shop for this duration before automatically stopping.
                    </p>
                    {errors.duration && (
                      <p className="text-xs text-red-500 mt-1">{errors.duration}</p>
                    )}
                  </div>

                  <div className="bg-gray-50/70 backdrop-blur-sm p-3 rounded-md border border-gray-200/70">
                    <div className="flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Countdown Timer</p>
                        <p className="text-xs text-gray-500">
                          A countdown timer will be displayed once AutoShop is activated, showing the remaining time.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="p-6 pt-4 bg-transparent">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Shopping method</h3>
                <RadioGroup
                  value={shoppingMethod}
                  onValueChange={(value) => handleShoppingMethodChange(value as any)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="categories" id="categories" />
                    <Label htmlFor="categories">Shop by categories</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prompt" id="prompt" />
                    <Label htmlFor="prompt">Shop by custom prompt</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random">Random shopping (surprise me!)</Label>
                  </div>
                </RadioGroup>
              </div>

              {shoppingMethod === 'categories' && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Select categories</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_CATEGORIES.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                          disabled={selectedCategories.length === 1 && selectedCategories.includes(category)}
                        />
                        <Label htmlFor={`category-${category}`}>{category}</Label>
                      </div>
                    ))}
                  </div>
                  {errors.categories && (
                    <p className="text-xs text-red-500 mt-2">{errors.categories}</p>
                  )}
                </div>
              )}

              {shoppingMethod === 'prompt' && (
                <div>
                  <h3 className="text-lg font-medium mb-3">Custom shopping prompt</h3>
                  <textarea
                    placeholder="Describe what you're looking for..."
                    value={settings.customPrompt}
                    onChange={(e) => setSettings({
                      ...settings,
                      customPrompt: e.target.value
                    })}
                    className={`w-full rounded-md border p-2 text-sm min-h-[100px] bg-white/70 backdrop-blur-sm ${errors.customPrompt ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Be specific about what you want the AI to shop for.
                  </p>
                  {errors.customPrompt && (
                    <p className="text-xs text-red-500 mt-1">{errors.customPrompt}</p>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between p-6 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
          <DialogClose asChild>
            <Button variant="outline" className="gap-2 rounded-md bg-white/80 hover:bg-white/90">
              <X className="h-4 w-4" /> Cancel
            </Button>
          </DialogClose>

          <div className="flex gap-2">
            {activeTab !== 'budget' && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="rounded-md bg-white/80 hover:bg-white/90"
              >
                Back
              </Button>
            )}

            {activeTab !== 'preferences' ? (
              <Button
                onClick={handleNext}
                className="gap-2 bg-black/90 text-white hover:bg-black rounded-md"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="gap-2 bg-black/90 text-white hover:bg-black rounded-md"
              >
                Start
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AutoShopSettingsDialogNew;
