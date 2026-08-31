import { Icon } from '@/components/ui/icon'
import { Input, type InputProps } from '@/components/ui/input'
import { cn } from '@/utils/cn'
import * as React from 'react'

export interface InputSearchProps extends InputProps {
	containerClassName?: string
}

const InputSearch = React.forwardRef<HTMLInputElement, InputSearchProps>(
	({ placeholder = 'Pesquisar', containerClassName, ...props }, ref) => {
		return (
			<div className={cn('relative', containerClassName)}>
				<Input
					type="search"
					placeholder={placeholder}
					ref={ref}
					className="pr-8"
					{...props}
				/>
				<div className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground">
					<Icon name="search" />
				</div>
			</div>
		)
	}
)
InputSearch.displayName = 'InputSearch'

export { InputSearch }
