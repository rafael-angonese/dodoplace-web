import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/cn'

const badgeVariants = cva(
	'inline-flex cursor-default items-center rounded-full border px-2.5 py-0.5 font-display text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
	{
		variants: {
			variant: {
				primary:
					'border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
				secondary:
					'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
				success:
					'bg-success/30 text-success border-success/40 hover:bg-success/40',
				warning:
					'bg-dodo-orange/20 text-foreground border-dodo-orange/50 hover:bg-dodo-orange/30',
				brand:
					'border-transparent bg-dodo-orange text-dodo-blue-deep hover:bg-dodo-orange-strong',
				danger:
					'bg-danger/30 text-danger border-danger/40 hover:bg-danger/40',
				outline: 'border-border text-foreground hover:bg-accent',
			},
		},
		defaultVariants: {
			variant: 'primary',
		},
	}
)

export interface BadgeProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
	return (
		<div
			className={cn(badgeVariants({ variant }), className)}
			{...props}
		/>
	)
}

export { Badge, badgeVariants }
