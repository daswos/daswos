import React, { useState, useEffect, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FixedSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: { value: string; label: string; disabled?: boolean }[];
  className?: string;
}

export function FixedSelect({
  value,
  onValueChange,
  placeholder = "Select an option",
  options,
  className,
}: FixedSelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Handle manual selection
  const handleSelect = (optionValue: string) => {
    // Find the option to check if it's disabled
    const option = options.find(opt => opt.value === optionValue);

    // Only change the value if the option is not disabled
    if (option && !option.disabled) {
      console.log(`Selecting option: ${optionValue}`);
      onValueChange(optionValue);
    }

    // Close the dropdown after selection with a small delay
    setTimeout(() => setOpen(false), 50);
  };

  // Handle click outside to close the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the click is outside the select component
      if (selectRef.current && !selectRef.current.contains(target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Log when component renders with current value and options
  useEffect(() => {
    console.log(`FixedSelect rendering with value: ${value}`);
    console.log('Available options:', options);
  }, [value, options]);

  return (
    <div className={`fixed-select-wrapper ${className || ""}`} ref={selectRef}>
      <Select
        value={value}
        onValueChange={handleSelect}
        open={open}
        onOpenChange={(isOpen) => {
          console.log(`Select dropdown ${isOpen ? 'opening' : 'closing'}`);
          setOpen(isOpen);
        }}
      >
        <SelectTrigger
          className="w-full cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={() => {
            console.log('Trigger clicked, toggling dropdown');
            setOpen(!open);
          }}
        >
          <SelectValue placeholder={placeholder} id="select-value-display">
            {options.find(option => option.value === value)?.label || placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="fixed-select-content z-[9999] w-full min-w-[var(--radix-select-trigger-width)]"
          sideOffset={5}
          onCloseAutoFocus={(e) => {
            // Prevent auto focus on close which can cause issues
            e.preventDefault();
          }}
          onEscapeKeyDown={() => setOpen(false)}
          onInteractOutside={(e) => {
            // We'll allow clicking outside to close the dropdown
            setOpen(false);
          }}
        >
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={`cursor-pointer ${value === option.value ? 'bg-accent text-accent-foreground font-medium' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Only handle selection if the option is not disabled
                if (!option.disabled) {
                  console.log(`SelectItem clicked: ${option.value}`);
                  // Force the value change even if it's the same as current value
                  console.log(`Setting value to: ${option.value}`);
                  onValueChange(option.value);
                  // Update the displayed value immediately
                  const selectValueElement = selectRef.current?.querySelector('[data-radix-select-value-id]');
                  if (selectValueElement) {
                    selectValueElement.textContent = option.label;
                  }
                  // Close the dropdown
                  setTimeout(() => setOpen(false), 50);
                } else {
                  console.log(`Attempted to select disabled option: ${option.value}`);
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <span>{option.label}</span>
                {value === option.value && (
                  <span className="text-primary ml-2">✓</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
