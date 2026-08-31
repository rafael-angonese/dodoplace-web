import { Button, type ButtonProps } from '@/components/ui/button'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/utils/cn'
import * as React from 'react'

export interface IconButtonProps extends ButtonProps {
	tooltip: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
	({ className, variant = 'ghost', tooltip, size = 'icon', ...props }, ref) => {
		return (
			<Tooltip text={tooltip}>
				<Button
					variant={variant}
					size={size}
					className={cn('h-8 w-8', className)}
					ref={ref}
					{...props}
				/>
			</Tooltip>
		)
	}
)
IconButton.displayName = 'IconButton'

export { IconButton }
