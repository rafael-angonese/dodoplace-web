import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

export const headingVariants = cva('', {
	variants: {
		variant: {
			h1: 'text-3xl font-bold tracking-tight lg:text-4xl',
			h2: 'text-2xl font-semibold tracking-tight lg:text-3xl',
			h3: 'text-xl font-semibold tracking-tight',
			h4: 'text-lg font-semibold tracking-tight',
			h5: 'text-base font-medium tracking-tight',
			h6: 'text-sm font-medium tracking-tight',
		},
		color: {
			default: 'text-foreground',
			primary: 'text-primary',
			secondary: 'text-secondary-foreground',
			success: 'text-success',
			warning: 'text-warning',
			danger: 'text-danger',
			muted: 'text-muted-foreground',
		},
	},
	defaultVariants: {
		variant: 'h1',
		color: 'default',
	},
})

export interface HeadingProps
	extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'>,
		VariantProps<typeof headingVariants> {}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
	({ className, variant = 'h1', color, ...props }, ref) => {
		const Comp = variant!
		return (
			<Comp
				className={cn(headingVariants({ variant, color, className }))}
				ref={ref}
				{...props}
			/>
		)
	}
)
