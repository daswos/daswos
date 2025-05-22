import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Coins,
  Clock,
  ShoppingBag,
  Tag,
  Shuffle,
  Save,
  X,
  AlertCircle
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AutoShopSettings, useAutoShop } from '@/contexts/autoshop-context';

// Interface for the dialog props

interface AutoShopSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: AutoShopSettings) => void;
  userCoins: number;
}

const DEFAULT_SETTINGS: AutoShopSettings = {
  maxTotalCoins: 1000,
  minItemPrice: 100,
  maxItemPrice: 500,
  duration: {
    value: 30,
    unit: 'minutes'
  },
  categories: [],
  customPrompt: '',
  useRandomMode: true, // Default to random mode to avoid category issues
  itemsPerMinute: 1 // Default to 1 item per minute
};

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

const AutoShopSettingsDialog: React.FC<AutoShopSettingsDialogProps> = ({
  open,
  onOpenChange,
  onSave,
  userCoins
}) => {
  const [settings, setSettings] = useState<AutoShopSettings>(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState<string>('budget');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    DEFAULT_SETTINGS.minItemPrice,
    DEFAULT_SETTINGS.maxItemPrice
  ]);
  const [selectionMode, setSelectionMode] = useState<'categories' | 'prompt' | 'random'>('random');
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
          setPriceRange([parsedSettings.minItemPrice, parsedSettings.maxItemPrice]);

          if (parsedSettings.useRandomMode) {
            setSelectionMode('random');
          } else if (parsedSettings.customPrompt && parsedSettings.customPrompt.trim() !== '') {
            setSelectionMode('prompt');
          } else {
            setSelectionMode('categories');
          }
        } catch (e) {
          console.error('Error parsing saved AutoShop settings:', e);
          setSettings(DEFAULT_SETTINGS);
          setPriceRange([DEFAULT_SETTINGS.minItemPrice, DEFAULT_SETTINGS.maxItemPrice]);
        }
      }
    }
  }, [open]);

  // Handle price range slider change
  const handlePriceRangeChange = (values: number[]) => {
    if (values.length === 2) {
      setPriceRange([values[0], values[1]]);
      setSettings(prev => ({
        ...prev,
        minItemPrice: values[0],
        maxItemPrice: values[1]
      }));
    }
  };

  // Handle category selection
  const handleCategoryToggle = (category: string) => {
    setSettings(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];

      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  // Handle selection mode change
  const handleSelectionModeChange = (mode: 'categories' | 'prompt' | 'random') => {
    setSelectionMode(mode);
    setSettings(prev => ({
      ...prev,
      useRandomMode: mode === 'random',
      // Clear categories if not using category mode
      categories: mode === 'categories' ? prev.categories : [],
      // Clear prompt if not using prompt mode
      customPrompt: mode === 'prompt' ? prev.customPrompt : ''
    }));
  };

  // Validate settings before saving
  const validateSettings = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Validate max total coins
    if (!settings.maxTotalCoins || settings.maxTotalCoins <= 0) {
      newErrors.maxTotalCoins = 'Please enter a valid amount';
    } else if (settings.maxTotalCoins > userCoins) {
      newErrors.maxTotalCoins = 'Amount exceeds your available coins';
    }

    // Validate price range
    if (settings.minItemPrice >= settings.maxItemPrice) {
      newErrors.priceRange = 'Minimum price must be less than maximum price';
    }

    // Validate duration
    if (!settings.duration.value || settings.duration.value <= 0) {
      newErrors.duration = 'Please enter a valid duration';
    }

    // Validate selection criteria
    if (selectionMode === 'categories' && settings.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
    } else if (selectionMode === 'prompt' && (!settings.customPrompt || settings.customPrompt.trim() === '')) {
      newErrors.customPrompt = 'Please enter a shopping prompt';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save button click
  const handleSave = () => {
    if (validateSettings()) {
      // Save settings to localStorage
      localStorage.setItem('daswos-autoshop-settings', JSON.stringify(settings));
      onSave(settings);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            AutoShop Settings
          </DialogTitle>
          <DialogDescription>
            Configure how the AI will shop for you. Your available balance:
            <span className="font-semibold text-primary ml-1 flex items-center gap-1 inline-flex">
              <Coins className="h-4 w-4" /> {userCoins.toLocaleString()} coins
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="budget" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="budget" className="flex items-center gap-1">
              <Coins className="h-4 w-4" /> Budget
            </TabsTrigger>
            <TabsTrigger value="time" className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> Time
            </TabsTrigger>
            <TabsTrigger value="preferences" className="flex items-center gap-1">
              <Tag className="h-4 w-4" /> Preferences
            </TabsTrigger>
          </TabsList>

          {/* Budget Tab */}
          <TabsContent value="budget" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="max-total-coins" className="text-base font-medium">
                  Maximum coins to spend
                </Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Coins className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="max-total-coins"
                    type="number"
                    value={settings.maxTotalCoins}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      maxTotalCoins: parseInt(e.target.value) || 0
                    }))}
                    className={errors.maxTotalCoins ? "border-destructive" : ""}
                  />
                </div>
                {errors.maxTotalCoins && (
                  <p className="text-destructive text-sm mt-1">{errors.maxTotalCoins}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  This is the maximum total amount the AI can spend in this AutoShop session.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-medium">Price range per item</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      <Coins className="h-3 w-3 inline mr-1" />
                      {priceRange[0]} - {priceRange[1]}
                    </span>
                  </div>
                </div>
                <div className="py-2">
                  <Slider
                    defaultValue={[settings.minItemPrice, settings.maxItemPrice]}
                    value={priceRange}
                    max={Math.max(1000, settings.maxTotalCoins)}
                    step={10}
                    onValueChange={handlePriceRangeChange}
                    className={`${errors.priceRange ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.priceRange && (
                  <p className="text-destructive text-sm">{errors.priceRange}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  The AI will only consider items within this price range. Prices are in dollars, and 1 DasWos Coin = $1.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Time Tab */}
          <TabsContent value="time" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Shopping duration</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="number"
                    value={settings.duration.value}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      duration: {
                        ...prev.duration,
                        value: parseInt(e.target.value) || 0
                      }
                    }))}
                    className={`w-24 ${errors.duration ? "border-destructive" : ""}`}
                  />
                  <Select
                    value={settings.duration.unit}
                    onValueChange={(value: 'minutes' | 'hours' | 'days') => setSettings(prev => ({
                      ...prev,
                      duration: {
                        ...prev.duration,
                        unit: value
                      }
                    }))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {errors.duration && (
                  <p className="text-destructive text-sm mt-1">{errors.duration}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  The AI will shop for this duration before automatically stopping.
                </p>
              </div>

              <div>
                <Label className="text-base font-medium">Items per minute</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    type="number"
                    value={settings.itemsPerMinute}
                    min={0}
                    max={10}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      itemsPerMinute: parseInt(e.target.value) || 0
                    }))}
                    className="w-24"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  The AI will select this many items per minute. Set to 0 to disable automatic selection.
                </p>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Countdown Timer</AlertTitle>
                <AlertDescription>
                  A countdown timer will be displayed once AutoShop is activated, showing the remaining time.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Shopping method</Label>
                <RadioGroup
                  value={selectionMode}
                  onValueChange={(value: 'categories' | 'prompt' | 'random') => handleSelectionModeChange(value)}
                  className="mt-2"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="categories" id="categories" />
                    <Label htmlFor="categories" className="font-normal cursor-pointer">
                      Shop by categories
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="prompt" id="prompt" />
                    <Label htmlFor="prompt" className="font-normal cursor-pointer">
                      Shop by custom prompt
                    </Label>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="random" id="random" />
                    <Label htmlFor="random" className="font-normal cursor-pointer">
                      Random shopping (surprise me!)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {selectionMode === 'categories' && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Select categories</Label>
                  {errors.categories && (
                    <p className="text-destructive text-sm">{errors.categories}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {AVAILABLE_CATEGORIES.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={settings.categories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <Label
                          htmlFor={`category-${category}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {category}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectionMode === 'prompt' && (
                <div className="space-y-2">
                  <Label htmlFor="custom-prompt" className="text-base font-medium">
                    Custom shopping prompt
                  </Label>
                  <Textarea
                    id="custom-prompt"
                    placeholder="E.g., I need gifts for a tech enthusiast who loves outdoor activities"
                    value={settings.customPrompt}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      customPrompt: e.target.value
                    }))}
                    className={errors.customPrompt ? "border-destructive" : ""}
                  />
                  {errors.customPrompt && (
                    <p className="text-destructive text-sm">{errors.customPrompt}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Describe what you're looking for and the AI will find matching items.
                  </p>
                </div>
              )}

              {selectionMode === 'random' && (
                <Alert className="bg-primary/10 border-primary/20">
                  <Shuffle className="h-4 w-4" />
                  <AlertTitle>Random Shopping Mode</AlertTitle>
                  <AlertDescription>
                    The AI will surprise you with random items within your budget constraints.
                    This is a fun way to discover new products you might not have considered!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center pt-2">
          <DialogClose asChild>
            <Button variant="outline" className="gap-1">
              <X className="h-4 w-4" /> Cancel
            </Button>
          </DialogClose>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setActiveTab(activeTab === 'budget' ? 'time' : activeTab === 'time' ? 'preferences' : 'budget')}
            >
              {activeTab === 'preferences' ? 'Back to Budget' : 'Next'}
            </Button>
            <Button onClick={handleSave} className="gap-1">
              <Save className="h-4 w-4" /> Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AutoShopSettingsDialog;
