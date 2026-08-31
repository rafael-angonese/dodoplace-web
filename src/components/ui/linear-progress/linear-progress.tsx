import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

import { cn } from '@/utils/cn'
import styles from './styles.module.css'

const linearProgressContainer = cva(
	'w-full bg-gray-200 dark:bg-white h-1 relative overflow-hidden rounded-full',
	{
		variants: {
			isLoading: {
				true: '',
				false: 'hidden',
			},
			indeterminate: {
				true: styles.indeterminate,
				false: '',
			},
		},
		defaultVariants: {
			isLoading: true,
			indeterminate: false,
		},
	}
)

const linearProgressBar = cva('h-full progressbar rounded-full bg-primary', {
	variants: {
		indeterminate: {
			true: `${styles.progressbar} absolute top-0`,
			false: '',
		},
		color: {
			default: 'bg-primary',
			primary: 'bg-primary',
			secondary: 'bg-secondary',
			success: 'bg-success',
			danger: 'bg-danger',
			warning: 'bg-warning',
		},
	},
	defaultVariants: {
		color: 'default',
		indeterminate: true,
	},
})

export interface LinearProgressProps
	extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color'>,
		VariantProps<typeof linearProgressContainer>,
		VariantProps<typeof linearProgressBar> {
	percentage?: number
}

export const LinearProgress: React.FC<LinearProgressProps> = ({
	color = 'default',
	indeterminate = true,
	isLoading = true,
	percentage = 100,
	className: classes,
	children,
}) => {
	return (
		<>
			<div
				className={cn(
					linearProgressContainer({ isLoading, indeterminate }),
					classes
				)}
			>
				<div
					className={linearProgressBar({ indeterminate, color })}
					style={{ width: `${percentage}%` }}
					role="progressbar"
					aria-valuenow={percentage}
					aria-valuemin={0}
					aria-valuemax={100}
				>
					<span className="flex items-center justify-end h-full pr-2 text-xs text-white">
						{children}
					</span>
				</div>
			</div>
		</>
	)
}
