import {
	addMonths,
	endOfMonth,
	endOfYear,
	format,
	getMonth,
	getYear,
	setMonth as setMonthFns,
	setYear,
	startOfMonth,
	startOfYear,
	subMonths,
} from 'date-fns'
import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Matcher } from 'react-day-picker'
import { DayPicker, TZDate } from 'react-day-picker'
import { ptBR as dayPickerPtBR } from 'react-day-picker/locale'

import { Button, buttonVariants } from '@/components/ui/button'
import { DateTimeInput } from '@/components/ui/datetime-input'
import { Icon } from '@/components/ui/icon'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/utils/cn'
import { ptBR } from 'date-fns/locale'

export type CalendarProps = Omit<React.ComponentProps<typeof DayPicker>, 'mode'>

export type DateTimePickerProps = {
	modal?: boolean
	value: Date | undefined | null
	onChange: (date: Date | undefined | null) => void
	min?: Date
	max?: Date
	timezone?: string
	disabled?: boolean

	placeholder?: string
}

export type DateTimeRenderTriggerProps = {
	value: Date | undefined | null
	open: boolean
	timezone?: string
	disabled?: boolean
	setOpen: (open: boolean) => void
}

export function DateTimePicker({
	value,
	onChange,
	min,
	max,
	timezone,
	disabled,
	modal = false,
	placeholder,
	...props
}: DateTimePickerProps & CalendarProps) {
	const [open, setOpen] = useState(false)
	const [monthYearPicker, setMonthYearPicker] = useState<
		'month' | 'year' | false
	>(false)
	const initDate = useMemo(
		() => new TZDate(value || new Date(), timezone),
		[value, timezone]
	)

	const [month, setMonth] = useState<Date>(initDate)
	const [date, setDate] = useState<Date>(initDate)

	const endMonth = useMemo(() => {
		return setYear(month, getYear(month) + 1)
	}, [month])
	const minDate = useMemo(
		() => (min ? new TZDate(min, timezone) : undefined),
		[min, timezone]
	)
	const maxDate = useMemo(
		() => (max ? new TZDate(max, timezone) : undefined),
		[max, timezone]
	)

	const onDayChanged = useCallback(
		(d: Date) => {
			d.setHours(date.getHours(), date.getMinutes(), date.getSeconds())
			if (min && d < min) {
				d.setHours(min.getHours(), min.getMinutes(), min.getSeconds())
			}
			if (max && d > max) {
				d.setHours(max.getHours(), max.getMinutes(), max.getSeconds())
			}
			setDate(d)
			onChange(new Date(d))
			setOpen(false)
		},
		[setDate, setMonth]
	)

	const onMonthYearChanged = useCallback(
		(d: Date, mode: 'month' | 'year') => {
			setMonth(d)
			if (mode === 'year') {
				setMonthYearPicker('month')
			} else {
				setMonthYearPicker(false)
			}
		},
		[setMonth, setMonthYearPicker]
	)
	const onNextMonth = useCallback(() => {
		setMonth(addMonths(month, 1))
	}, [month])
	const onPrevMonth = useCallback(() => {
		setMonth(subMonths(month, 1))
	}, [month])

	useEffect(() => {
		if (open) {
			setDate(initDate)
			setMonth(initDate)
			setMonthYearPicker(false)
		}
	}, [open, initDate])

	const displayValue = useMemo(() => {
		if (!open && !value) return value
		return open ? date : initDate
	}, [date, value, open])

	return (
		<Popover
			open={open}
			onOpenChange={setOpen}
			modal={modal}
		>
			<PopoverTrigger asChild>
				<DateTimeInput
					value={displayValue}
					onChange={(x) => !open && onChange(x)}
					disabled={open || disabled}
					onCalendarClick={() => setOpen(!open)}
					placeholder={placeholder}
				/>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-2">
				<div className="flex items-center justify-between">
					<div className="text-md font-bold ms-2 flex items-center cursor-pointer">
						<div>
							<span
								onClick={() =>
									setMonthYearPicker(
										monthYearPicker === 'month' ? false : 'month'
									)
								}
							>
								{format(month, 'MMMM', { locale: ptBR })}
							</span>
							<span
								className="ms-1"
								onClick={() =>
									setMonthYearPicker(
										monthYearPicker === 'year' ? false : 'year'
									)
								}
							>
								{format(month, 'yyyy')}
							</span>
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() =>
								setMonthYearPicker(monthYearPicker ? false : 'year')
							}
						>
							{monthYearPicker ? (
								<Icon name="chevron-up-icon" />
							) : (
								<Icon name="chevron-down-icon" />
							)}
						</Button>
					</div>
					<div className={cn('flex gap-x-2', monthYearPicker ? 'hidden' : '')}>
						<Button
							variant="ghost"
							size="icon"
							onClick={onPrevMonth}
						>
							<Icon name="chevron-left-icon" />
						</Button>
						<Button
							variant="ghost"
							size="icon"
							onClick={onNextMonth}
						>
							<Icon name="chevron-right-icon" />
						</Button>
					</div>
				</div>
				<div className="relative overflow-hidden">
					<DayPicker
						timeZone={timezone}
						mode="single"
						selected={date}
						onDayClick={(d) => d && onDayChanged(d)}
						month={month}
						locale={dayPickerPtBR}
						endMonth={endMonth}
						disabled={
							[
								max ? { after: max } : null,
								min ? { before: min } : null,
							].filter(Boolean) as Matcher[]
						}
						onMonthChange={setMonth}
						classNames={{
							dropdowns: 'flex w-full gap-2',
							months: 'flex w-full h-fit',
							month: 'flex flex-col w-full',
							month_caption: 'hidden',
							button_previous: 'hidden',
							button_next: 'hidden',
							month_grid: 'w-full border-collapse',
							weekdays: 'flex justify-between mt-2',
							weekday:
								'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
							week: 'flex w-full justify-between mt-2',
							day: 'h-9 w-9 text-center text-sm p-0 relative flex items-center justify-center [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 rounded-1',
							day_button: cn(
								buttonVariants({ variant: 'ghost' }),
								'size-9 rounded-md p-0 font-normal aria-selected:opacity-100'
							),
							range_end: 'day-range-end',
							selected:
								'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-l-md rounded-r-md',
							today: 'text-primary',
							outside:
								'day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
							disabled: 'text-muted-foreground opacity-50',
							range_middle:
								'aria-selected:bg-accent aria-selected:text-accent-foreground',
							hidden: 'invisible',
						}}
						showOutsideDays={true}
						{...props}
					/>
					<div
						className={cn(
							'absolute top-0 left-0 bottom-0 right-0',
							monthYearPicker ? 'bg-popover' : 'hidden'
						)}
					></div>
					<MonthYearPicker
						value={month}
						mode={monthYearPicker as 'month' | 'year'}
						onChange={onMonthYearChanged}
						minDate={minDate}
						maxDate={maxDate}
						className={cn(
							'absolute top-0 left-0 bottom-0 right-0',
							monthYearPicker ? '' : 'hidden'
						)}
					/>
				</div>
			</PopoverContent>
		</Popover>
	)
}

function MonthYearPicker({
	value,
	minDate,
	maxDate,
	mode = 'month',
	onChange,
	className,
}: {
	value: Date
	mode: 'month' | 'year'
	minDate?: Date
	maxDate?: Date
	onChange: (value: Date, mode: 'month' | 'year') => void
	className?: string
}) {
	const yearRef = useRef<HTMLDivElement>(null)
	const years = useMemo(() => {
		const years: TimeOption[] = []
		for (let i = 1912; i < 2100; i++) {
			let disabled = false
			const startY = startOfYear(setYear(value, i))
			const endY = endOfYear(setYear(value, i))
			if (minDate && endY < minDate) disabled = true
			if (maxDate && startY > maxDate) disabled = true
			years.push({ value: i, label: i.toString(), disabled })
		}
		return years
	}, [value])
	const months = useMemo(() => {
		const months: TimeOption[] = []
		for (let i = 0; i < 12; i++) {
			let disabled = false
			const startM = startOfMonth(setMonthFns(value, i))
			const endM = endOfMonth(setMonthFns(value, i))
			if (minDate && endM < minDate) disabled = true
			if (maxDate && startM > maxDate) disabled = true
			months.push({
				value: i,
				label: format(new Date(0, i), 'MMM', { locale: ptBR }),
				disabled,
			})
		}
		return months
	}, [value])

	const onYearChange = useCallback(
		(v: TimeOption) => {
			let newDate = setYear(value, v.value)
			if (minDate && newDate < minDate) {
				newDate = setMonthFns(newDate, getMonth(minDate))
			}
			if (maxDate && newDate > maxDate) {
				newDate = setMonthFns(newDate, getMonth(maxDate))
			}
			onChange(newDate, 'year')
		},
		[onChange, value, minDate, maxDate]
	)

	useEffect(() => {
		if (mode === 'year') {
			yearRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' })
		}
	}, [mode, value])
	return (
		<div className={cn(className)}>
			<ScrollArea className="h-full">
				{mode === 'year' && (
					<div className="grid grid-cols-4">
						{years.map((year) => (
							<div
								key={year.value}
								ref={year.value === getYear(value) ? yearRef : undefined}
							>
								<Button
									disabled={year.disabled}
									variant={getYear(value) === year.value ? 'default' : 'ghost'}
									className="rounded-full"
									onClick={() => onYearChange(year)}
								>
									{year.label}
								</Button>
							</div>
						))}
					</div>
				)}
				{mode === 'month' && (
					<div className="grid grid-cols-3 gap-4">
						{months.map((month) => (
							<Button
								key={month.value}
								size="lg"
								disabled={month.disabled}
								variant={getMonth(value) === month.value ? 'default' : 'ghost'}
								className="rounded-full"
								onClick={() =>
									onChange(setMonthFns(value, month.value), 'month')
								}
							>
								{month.label}
							</Button>
						))}
					</div>
				)}
			</ScrollArea>
		</div>
	)
}

interface TimeOption {
	value: number
	label: string
	disabled: boolean
}
