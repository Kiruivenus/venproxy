import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-blue-600 dark:hover:bg-blue-500 shadow-sm border border-transparent',
        destructive:
          'bg-destructive text-white hover:bg-red-600 dark:hover:bg-red-500 shadow-sm border border-transparent',
        outline:
          'border border-slate-200 dark:border-border bg-transparent text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-slate-900/60 shadow-xs hover:border-slate-300 dark:hover:border-slate-700',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-transparent',
        ghost:
          'hover:bg-slate-50 dark:hover:bg-slate-900/40 hover:text-slate-800 dark:hover:text-zinc-200',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-5 has-[>svg]:px-4',
        sm: 'h-9 rounded-lg gap-1.5 px-3.5 has-[>svg]:px-3',
        lg: 'h-12 rounded-xl px-7 has-[>svg]:px-5',
        icon: 'size-11 rounded-xl',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-12 rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
