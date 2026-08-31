import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { createLink } from '@tanstack/react-router'
import * as React from 'react'

const BaseLink = React.forwardRef<
	HTMLAnchorElement,
	React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ className, ...props }, ref) => {
	return (
		<a
			ref={ref}
			className={cn(
				buttonVariants({ variant: 'link', size: 'link' }),
				className
			)}
			{...props}
		/>
	)
})
BaseLink.displayName = 'BaseLink'

export const Link = createLink(BaseLink)
