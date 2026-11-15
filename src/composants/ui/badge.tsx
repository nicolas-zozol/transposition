import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/* Réglages BL Demo (design-system/shadcn.md) : statuts en teinte douce (success, warning, info,
   destructive), rounded-md, 24 px de haut. « contour » garde la couleur du ton sur fond transparent. */
const badgeVariants = cva(
  "inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 font-sans text-xs font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        neutral: "bg-muted text-foreground",
        primary: "bg-secondary text-secondary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        info: "bg-info-soft text-info",
        destructive: "bg-destructive-soft text-destructive",
        outline: "border-border text-foreground",
      },
      contour: {
        true: "border-[color-mix(in_oklab,currentColor_40%,transparent)] bg-transparent",
        false: "",
      },
    },
    compoundVariants: [{ variant: "primary", contour: true, className: "text-primary" }],
    defaultVariants: {
      variant: "neutral",
      contour: false,
    },
  }
)

function Badge({
  className,
  variant = "neutral",
  contour = false,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, contour }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
