import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/utils/cn'

const badgeVariants = cva(
	'inline-flex cursor-default items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
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
					'bg-warning/30 text-muted-foreground dark:text-warning border-warning/40 hover:bg-warning/40',
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
