import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { Image, Upload, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Stock photos for non-logged-in users using Unsplash API for placeholder images
const stockPhotos = [
  { id: 1, url: 'https://source.unsplash.com/random/800x600?workspace', alt: 'Modern workspace with laptop' },
  { id: 2, url: 'https://source.unsplash.com/random/800x600?mountains', alt: 'Mountain landscape' },
  { id: 3, url: 'https://source.unsplash.com/random/800x600?city', alt: 'City skyline' },
  { id: 4, url: 'https://source.unsplash.com/random/800x600?beach', alt: 'Beach sunset' },
  { id: 5, url: 'https://source.unsplash.com/random/800x600?forest', alt: 'Forest path' },
];

interface PhotoSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (photoUrl: string) => void;
}

const PhotoSelector: React.FC<PhotoSelectorProps> = ({
  isOpen,
  onClose,
  onSelectPhoto
}) => {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle stock photo selection
  const handleSelectStockPhoto = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setSelectedPhoto(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle upload button click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle confirm selection
  const handleConfirm = () => {
    if (selectedPhoto) {
      onSelectPhoto(selectedPhoto);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Background Photo</DialogTitle>
          <DialogDescription>
            Choose a background photo for your home page.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={user ? "upload" : "stock"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stock">Stock Photos</TabsTrigger>
            {user && <TabsTrigger value="upload">Upload Photo</TabsTrigger>}
          </TabsList>

          <TabsContent value="stock" className="mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto p-1">
              {stockPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className={`relative cursor-pointer border-2 rounded-md overflow-hidden h-24 ${
                    selectedPhoto === photo.url ? 'border-blue-500' : 'border-transparent'
                  }`}
                  onClick={() => handleSelectStockPhoto(photo.url)}
                >
                  <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <Image className="h-6 w-6 text-gray-400" />
                  </div>
                  <img
                    src={photo.url}
                    alt={photo.alt}
                    className="w-full h-full object-cover relative z-10"
                    onError={(e) => {
                      // If image fails to load, show fallback
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  {selectedPhoto === photo.url && (
                    <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1 z-20">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {user && (
            <TabsContent value="upload" className="mt-4">
              <div className="flex flex-col items-center justify-center">
                {uploadedImage ? (
                  <div className="relative w-full h-48 mb-4">
                    <img
                      src={uploadedImage}
                      alt="Uploaded preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => setUploadedImage(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-md p-8 w-full h-48 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                    onClick={handleUploadClick}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Click to upload an image</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </TabsContent>
          )}
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedPhoto}
          >
            Apply Background
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoSelector;
