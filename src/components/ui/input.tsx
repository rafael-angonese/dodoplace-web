import { cn } from '@/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const inputVariants = cva(
	'flex h-10 w-full rounded-lg border border-input bg-input-bg px-3 py-2 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all',
	{
		variants: {
			error: {
				true: 'border-danger !ring-danger',
			},
		},
	}
)

export interface InputProps
	extends React.ComponentProps<'input'>,
		VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
	({ className, type, error, ...props }, ref) => {
		return (
			<input
				type={type}
				className={cn(
					inputVariants({
						error,
					}),
					className
				)}
				ref={ref}
				autoComplete="off"
				{...props}
			/>
		)
	}
)
Input.displayName = 'Input'

export { Input }
