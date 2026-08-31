import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'

interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
	indeterminate?: boolean
}

const Checkbox = React.forwardRef<
	React.ElementRef<typeof CheckboxPrimitive.Root>,
	CheckboxProps
>(({ className, indeterminate, checked, ...props }, ref) => {
	const checkboxRef = React.useRef<HTMLButtonElement>(null)

	React.useImperativeHandle(ref, () => checkboxRef.current!)

	React.useEffect(() => {
		if (checkboxRef.current) {
			const checkbox = checkboxRef.current as any
			checkbox.indeterminate = indeterminate
		}
	}, [indeterminate])

	return (
		<CheckboxPrimitive.Root
			ref={checkboxRef}
			checked={indeterminate ? 'indeterminate' : checked}
			className={cn(
				'checkbox-fix-scroll cursor-pointer peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
				className
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				className={cn('flex items-center justify-center text-current')}
			>
				{indeterminate ? (
					<Icon
						name="minus"
						className="h-4 w-4"
					/>
				) : (
					<Icon
						name="check"
						className="h-4 w-4"
					/>
				)}
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	)
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
