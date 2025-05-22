import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const TransparentDialog = DialogPrimitive.Root

const TransparentDialogTrigger = DialogPrimitive.Trigger

const TransparentDialogPortal = DialogPrimitive.Portal

const TransparentDialogClose = DialogPrimitive.Close

const TransparentDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-[9999] bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
TransparentDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const TransparentDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <TransparentDialogPortal>
      <TransparentDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-[9999] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] rounded-xl border border-gray-200 dark:border-gray-800",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </TransparentDialogPortal>
  );
})
TransparentDialogContent.displayName = DialogPrimitive.Content.displayName

const TransparentDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
TransparentDialogHeader.displayName = "TransparentDialogHeader"

const TransparentDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
TransparentDialogFooter.displayName = "TransparentDialogFooter"

const TransparentDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
TransparentDialogTitle.displayName = DialogPrimitive.Title.displayName

const TransparentDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-gray-600", className)}
    {...props}
  />
))
TransparentDialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  TransparentDialog,
  TransparentDialogPortal,
  TransparentDialogOverlay,
  TransparentDialogClose,
  TransparentDialogTrigger,
  TransparentDialogContent,
  TransparentDialogHeader,
  TransparentDialogFooter,
  TransparentDialogTitle,
  TransparentDialogDescription,
}
