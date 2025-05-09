import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  maxSizeMB?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  className,
  maxSizeMB = 5 // Default max size is 5MB
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Max file size in bytes
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Handle file validation and processing
  const handleFiles = (files: FileList) => {
    const file = files[0];
    setError(null);
    
    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/i)) {
      setError('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
      return;
    }
    
    // Validate file size
    if (file.size > maxSizeBytes) {
      setError(`File size exceeds the maximum limit of ${maxSizeMB}MB`);
      return;
    }
    
    // Upload the file
    uploadFile(file);
  };

  // Simulate file upload (in production, you'd send to a server)
  const uploadFile = (file: File) => {
    setIsUploading(true);
    
    // Convert file to base64 for preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target && e.target.result) {
        const result = e.target.result as string;
        setPreviewUrl(result);
        onChange(result); // Pass base64 string to parent component
        setIsUploading(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // URL input handling
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreviewUrl(url);
  };

  // Trigger file input click
  const onButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clear the image
  const clearImage = () => {
    onChange('');
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* File upload area */}
      <div 
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          previewUrl ? 'border-success' : ''
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
        
        {previewUrl ? (
          <div className="relative">
            <div className="absolute top-0 right-0 m-2">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-6 w-6 rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex items-center justify-center">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-48 max-w-full object-contain rounded-md"
                onError={() => setError('Failed to load image')}
              />
            </div>
            <div className="mt-2 flex items-center justify-center text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4 mr-1" />
              Image uploaded
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className={cn(
                "p-3 rounded-full",
                dragActive ? "bg-primary/10" : "bg-muted"
              )}>
                <UploadCloud className={cn(
                  "h-6 w-6",
                  dragActive ? "text-primary" : "text-muted-foreground"
                )} />
              </div>
              <div className="text-sm font-medium">
                {isUploading ? (
                  <span>Uploading...</span>
                ) : (
                  <span>Drag and drop an image or click to browse</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Supported formats: JPEG, PNG, GIF, WebP (max {maxSizeMB}MB)
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <div className="text-sm text-destructive">
          {error}
        </div>
      )}
      
      {/* Or divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/20"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-2 text-xs text-muted-foreground">
            OR ENTER IMAGE URL
          </span>
        </div>
      </div>
      
      {/* URL input */}
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-muted rounded">
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input
          type="url"
          placeholder="https://example.com/image.jpg"
          value={value}
          onChange={handleUrlChange}
          className="flex-1"
        />
      </div>
    </div>
  );
};

export default ImageUpload;