"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

/* Réglages BL Demo (design-system/shadcn.md) : deux formes.
   - « souligne » : les files d'une liste, sans fond, filet bas, onglet actif souligné de 2 px en primary ;
   - « segmente » : la bascule de deux ou trois modes, en pilule, onglet actif plein en primary. */
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

const tabsListVariants = cva("group/tabs-list", {
  variants: {
    variant: {
      souligne: "flex gap-6 overflow-x-auto rounded-none border-b bg-transparent",
      segmente: "inline-flex w-fit items-center rounded-full bg-muted p-1",
    },
  },
  defaultVariants: { variant: "souligne" },
})

function TabsList({
  className,
  variant = "souligne",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex flex-none cursor-pointer items-center gap-1.5 font-sans text-sm font-medium whitespace-nowrap text-muted-foreground outline-none hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4",
        "group-data-[variant=souligne]/tabs-list:-mb-px group-data-[variant=souligne]/tabs-list:h-11 group-data-[variant=souligne]/tabs-list:border-b-2 group-data-[variant=souligne]/tabs-list:border-transparent group-data-[variant=souligne]/tabs-list:focus-visible:rounded-sm group-data-[variant=souligne]/tabs-list:focus-visible:shadow-[inset_0_0_0_2px_var(--ring)] group-data-[variant=souligne]/tabs-list:data-[state=active]:border-primary group-data-[variant=souligne]/tabs-list:data-[state=active]:text-foreground",
        "group-data-[variant=segmente]/tabs-list:h-8 group-data-[variant=segmente]/tabs-list:flex-1 group-data-[variant=segmente]/tabs-list:justify-center group-data-[variant=segmente]/tabs-list:rounded-full group-data-[variant=segmente]/tabs-list:px-5 group-data-[variant=segmente]/tabs-list:focus-anneau group-data-[variant=segmente]/tabs-list:data-[state=active]:bg-primary group-data-[variant=segmente]/tabs-list:data-[state=active]:text-primary-foreground",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none", className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants }
