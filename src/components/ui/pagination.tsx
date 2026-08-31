import { cn } from '@/utils/cn'
import React from 'react'

interface ItemButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	isActive?: boolean
}

const ItemButton: React.FC<ItemButtonProps> = ({
	isActive = false,
	className: classes,
	children,
	...props
}) => {
	return (
		<>
			<button
				{...props}
				className={cn(
					'cursor-pointer disabled:cursor-not-allowed items-center px-4 py-2 transition-colors duration-300 transform bg-background border border-border rounded-md sm:flex',
					{
						'!bg-accent text-text-accent-foreground  ring-1': isActive,
					},
					[classes]
				)}
			>
				{children}
			</button>
		</>
	)
}
interface PaginationProps {
	page: number
	totalPages: number
	onPageChange: (value: number) => void
}

export const Pagination: React.FC<PaginationProps> = ({
	page,
	totalPages,
	onPageChange,
}) => {
	const pageNeighbours = 2

	const gotoPage = (value: number) => {
		const currentPage = Math.max(0, Math.min(value, totalPages))

		onPageChange(currentPage)
	}

	const range = (from: number, to: number, step = 1) => {
		let i = from
		const range = []

		while (i <= to) {
			range.push(i)
			i += step
		}

		return range
	}

	const fetchPageNumbers = () => {
		const totalNumbers = pageNeighbours * 2 + 1
		const totalBlocks = totalNumbers + 2

		if (totalPages > totalBlocks) {
			const leftBound = Math.max(2, page - pageNeighbours)
			const rightBound = Math.min(totalPages - 1, page + pageNeighbours)

			const pages = range(leftBound, rightBound)

			return [1, ...pages, totalPages]
		}

		return range(1, totalPages)
	}

	const handleMoveRight = () => {
		gotoPage(page + 1)
	}

	const handleMoveLeft = () => {
		gotoPage(page - 1)
	}

	const pages = fetchPageNumbers()

	return (
		<>
			<div
				data-testid="pagination"
				className="flex flex-wrap gap-1"
			>
				<ItemButton
					isActive={false}
					onClick={handleMoveLeft}
					disabled={page === 1}
				>
					&laquo;
				</ItemButton>

				{pages.map((currentPage, index) => {
					return (
						<ItemButton
							isActive={page === currentPage}
							onClick={() => gotoPage(+currentPage)}
							key={index}
						>
							{currentPage}
						</ItemButton>
					)
				})}

				<ItemButton
					isActive={false}
					onClick={handleMoveRight}
					disabled={page === totalPages}
				>
					&raquo;
				</ItemButton>
			</div>
		</>
	)
}
