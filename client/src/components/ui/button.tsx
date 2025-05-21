import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#222222] text-[#888888] hover:text-[#cccccc] active:text-white border-none rounded-none",
        destructive:
          "bg-[#222222] text-[#888888] hover:text-[#cccccc] active:text-white border-none rounded-none",
        outline:
          "bg-[#222222] text-[#888888] hover:text-[#cccccc] active:text-white border-none rounded-none",
        secondary:
          "bg-[#222222] text-[#888888] hover:text-[#cccccc] active:text-white border-none rounded-none",
        ghost: "bg-transparent text-[#888888] hover:text-[#cccccc] active:text-white border-none rounded-none",
        link: "bg-transparent text-[#888888] hover:text-[#cccccc] active:text-white underline-offset-4 hover:underline border-none rounded-none",
        stylish: "bg-[#222222] text-[#888888] hover:text-[#cccccc] active:text-white border-none rounded-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 px-3 py-1",
        lg: "h-12 px-8 py-3",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
