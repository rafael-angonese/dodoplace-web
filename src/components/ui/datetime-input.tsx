import * as React from 'react'

import { Icon } from '@/components/ui/icon'
import { cn } from '@/utils/cn'
import { format, isValid, parse } from 'date-fns'
import { useEffect, useState } from 'react'

type DateTimeInputProps = {
	className?: string
	value?: Date | null
	onChange?: (date?: Date | null) => void
	disabled?: boolean
	clearable?: boolean
	hideCalendarIcon?: boolean
	onCalendarClick?: () => void
	placeholder?: string
}

const DateTimeInput = React.forwardRef<HTMLInputElement, DateTimeInputProps>(
	(
		{
			value,
			placeholder,
			onChange,
			onCalendarClick,
			className,
			hideCalendarIcon,
			disabled,
		},
		ref
	) => {
		const [dateString, setDateString] = useState<string>('')
		const [hasError, setHasError] = useState(false)

		const [isFocused, setIsFocused] = useState(false)

		useEffect(() => {
			if (value && isValid(value)) {
				setDateString(format(value, 'dd/MM/yyyy'))
			} else if (!value) {
				setDateString('')
			}
		}, [value])

		const parseDate = (dateStr: string) => {
			if (!dateStr) return undefined

			try {
				const parsedDate = parse(dateStr, 'dd/MM/yyyy', new Date())
				if (isValid(parsedDate)) {
					return parsedDate
				}
				return undefined
			} catch (error) {
				console.error(error)
				return undefined
			}
		}

		const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			let raw = e.target.value.replace(/[^\d]/g, '')

			if (raw.length === 4) {
				const monthStart = raw.slice(2, 3)
				const monthLast = raw.slice(3, 4)

				if (parseInt(monthStart, 10) === 1 && parseInt(monthLast, 10) > 2) {
					raw = raw.slice(0, 2) + monthStart
				}
			}

			if (raw.length === 3) {
				let month = raw.slice(2, 3)
				if (parseInt(month, 10) > 1) {
					month = '0' + month
				}
				raw = raw.slice(0, 2) + month
			}

			if (raw.length === 2) {
				const dayStart = raw.slice(0, 1)
				const dayLast = raw.slice(1, 2)

				if (parseInt(dayStart, 10) === 3 && parseInt(dayLast, 10) > 2) {
					raw = dayStart
				}
			}

			if (raw.length === 1) {
				let day = raw
				if (parseInt(raw, 10) > 3) {
					day = '0' + day
				}
				raw = day
			}

			let newValue = raw
			if (newValue.length > 2) {
				newValue = newValue.slice(0, 2) + '/' + newValue.slice(2)
			}
			if (newValue.length > 5) {
				newValue = newValue.slice(0, 5) + '/' + newValue.slice(5, 9)
			}
			newValue = newValue.slice(0, 10)

			setDateString(newValue)

			if (newValue.length === 10) {
				const parsedDate = parseDate(newValue)
				if (parsedDate) {
					setHasError(false)
					onChange?.(parsedDate)
				} else {
					setHasError(true)
				}
			} else if (newValue.length > 0 && newValue.length < 10) {
				setHasError(true)
			} else if (newValue.length === 0) {
				setHasError(false)
				onChange?.(null)
			}
		}

		return (
			<div
				ref={ref}
				className={cn(
					'flex h-10 items-center justify-start rounded-lg border border-input bg-input-bg text-sm ring-offset-background placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 transition-all overflow-hidden min-w-32.5',
					isFocused ? 'outline-none ring-2 ring-ring ring-offset-1' : '',
					hasError && 'border-destructive',
					hideCalendarIcon && 'ps-2',
					className
				)}
			>
				{!hideCalendarIcon && (
					<button
						type="button"
						disabled={disabled}
						onClick={onCalendarClick}
						className="h-full px-1.5 flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<Icon
							name="calendar-icon"
							className="size-4 text-muted-foreground"
						/>
					</button>
				)}
				<input
					ref={ref}
					className="border-none bg-transparent font-mono w-full flex-grow min-w-0 py-1 px-1.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
					onFocus={() => setIsFocused(true)}
					onBlur={() => setIsFocused(false)}
					placeholder={placeholder}
					value={dateString}
					onChange={handleInputChange}
					disabled={disabled}
					maxLength={10}
				/>
			</div>
		)
	}
)

DateTimeInput.displayName = 'DateTimeInput'

export { DateTimeInput }
