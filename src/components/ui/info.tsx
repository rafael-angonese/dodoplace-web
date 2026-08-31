import { Icon, type IconProps } from '@/components/ui/icon'
import { cn } from '@/utils/cn'
import type { ComponentProps } from 'react'

const InfoItem: React.FC<ComponentProps<'div'>> = ({
	className,
	children,
	...props
}) => {
	return (
		<div
			className={cn('flex items-start gap-3', className)}
			{...props}
		>
			{children}
		</div>
	)
}
InfoItem.displayName = 'InfoItem'

const InfoContainer: React.FC<ComponentProps<'div'>> = ({
	children,
	...props
}) => {
	return <div {...props}>{children}</div>
}
InfoContainer.displayName = 'InfoContainer'

const InfoIcon: React.FC<IconProps> = ({ className, ...props }) => {
	return (
		<InfoContainer>
			<Icon
				className={cn('h-5 w-5 text-muted-foreground mt-0.5', className)}
				{...props}
			/>
		</InfoContainer>
	)
}
InfoIcon.displayName = 'InfoIcon'

const InfoLabel: React.FC<ComponentProps<'p'>> = ({
	className,
	children,
	...props
}) => {
	return (
		<p
			className={cn('font-bold text-sm text-muted-foreground', className)}
			{...props}
		>
			{children}
		</p>
	)
}
InfoLabel.displayName = 'InfoLabel'

const InfoValue: React.FC<ComponentProps<'p'>> = ({
	className,
	children,
	...props
}) => {
	return (
		<p
			className={cn('text-accent-foreground', className)}
			{...props}
		>
			{children ? children : '-'}
		</p>
	)
}
InfoValue.displayName = 'InfoValue'

export { InfoItem, InfoIcon, InfoContainer, InfoLabel, InfoValue }
