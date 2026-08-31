import { cn } from '@/utils/cn'
import React, { type ComponentProps } from 'react'

export const Grid: React.FC<ComponentProps<'div'>> = ({
	className,
	...props
}) => {
	return (
		<>
			<div
				className={cn('grid grid-cols-12 gap-2', className)}
				{...props}
			/>
		</>
	)
}
