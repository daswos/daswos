import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 relative",
  {
    variants: {
      variant: {
        default: "bg-transparent text-[#333333] hover:text-[#000000] active:text-[#000000] dark:text-[#888888] dark:hover:text-[#cccccc] dark:active:text-white border-none rounded-none",
        ghost: "bg-transparent text-[#333333] hover:text-[#000000] active:text-[#000000] dark:text-[#888888] dark:hover:text-[#cccccc] dark:active:text-white border-none rounded-none",
      },
      size: {
        default: "h-10 w-10",
        sm: "h-8 w-8",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: React.ReactNode;
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, tooltip, ...props }, ref) => {
    return (
      <button
        className={cn(iconButtonVariants({ variant, size, className }), "group")}
        ref={ref}
        title={tooltip}
        {...props}
      >
        {icon}
        {tooltip && (
          <>
            <span className="sr-only">{tooltip}</span>
            <span className="absolute left-16 bg-[#E0E0E0] dark:bg-[#222222] text-[#333333] dark:text-[#cccccc] px-2 py-1 text-xs whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-[1002]">
              {tooltip}
            </span>
          </>
        )}
      </button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
