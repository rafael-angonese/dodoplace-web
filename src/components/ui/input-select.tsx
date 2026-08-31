import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from '@/components/ui/command'
import { Icon } from '@/components/ui/icon'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/utils/cn'
import { normalizeTextSearch } from '@/utils/normalize-text-search'
import * as React from 'react'
import type { Dispatch, SetStateAction } from 'react'

type SetState<T> = Dispatch<SetStateAction<T>>

interface InputSelectProvided<T> {
	options: T[]
	onValueChange?: (v: string) => void
	placeholder: string
	clearable: boolean
	disabled: boolean
	selectedValue: string | string[] | null
	setSelectedValue: SetState<string | string[] | null>
	isPopoverOpen: boolean
	setIsPopoverOpen: SetState<boolean>
	onOptionSelect: (v: string) => void
	onRemoveSelectedValue?: (optionValue: string) => void
	onClearAllOptions: () => void
	getOptionLabel: (option: T) => string
	getOptionValue: (option: T) => string
	limitTags: number
}

export interface InputSelectProps<T, Multiple extends boolean = false> {
	options: T[]
	value?: Multiple extends true ? Array<T | string> : T | string | null
	onChange?: (v: Multiple extends true ? T[] : T | null) => void
	onValueChange?: (v: Multiple extends true ? string[] : string | null) => void
	multiple?: Multiple
	placeholder?: string
	clearable?: boolean
	disabled?: boolean
	className?: string
	classNameTrigger?: string
	style?: React.CSSProperties
	noOptionsMessage?: string
	clearMessage?: string
	closeMessage?: string
	searchMessage?: string
	selectAllMessage?: string
	selectAllOption?: boolean
	onSelectAll?: (selected: boolean) => void
	onSearch?: (value: string) => void
	search?: string
	async?: boolean
	isLoading?: boolean
	getOptionLabel: (option: T) => string
	getOptionValue: (option: T) => string
	limitTags?: number
}

export const InputSelect = <T, Multiple extends boolean = false>({
	options,
	value,
	onChange,
	onValueChange,
	multiple,
	placeholder = 'Selecione...',
	clearable = false,
	disabled = false,
	className,
	classNameTrigger,
	noOptionsMessage = 'Nenhum resultado encontrado.',
	clearMessage = 'Limpar',
	closeMessage = 'Fechar',
	searchMessage = 'Buscar...',
	selectAllMessage = 'Selecionar Todos',
	selectAllOption = false,
	onSelectAll,
	onSearch,
	search,
	async = false,
	isLoading,
	getOptionLabel,
	getOptionValue,
	limitTags = 3,
	...restProps
}: InputSelectProps<T, Multiple>) => {
	const [selectedValue, setSelectedValue] = React.useState<
		string | string[] | null
	>(() => {
		if (multiple) {
			return Array.isArray(value)
				? value.map((v) => (typeof v === 'string' ? v : getOptionValue(v)))
				: []
		}
		return value
			? typeof value === 'string'
				? value
				: getOptionValue(value as T)
			: null
	})
	const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)

	const onOptionSelect = (optionValue: string) => {
		if (multiple) {
			const current = Array.isArray(selectedValue) ? [...selectedValue] : []
			const exists = current.includes(optionValue)
			const updated = exists
				? current.filter((v) => v !== optionValue)
				: [...current, optionValue]

			if (exists && onSelectAll) {
				onSelectAll(false)
			}

			setSelectedValue(updated)
			onValueChange?.(
				updated as Multiple extends true ? string[] : string | null
			)

			const selected = options.filter((opt) =>
				updated.includes(getOptionValue(opt))
			)
			onChange?.(selected as Multiple extends true ? T[] : T | null)
		} else {
			setSelectedValue(optionValue)
			onValueChange?.(
				optionValue as Multiple extends true ? string[] : string | null
			)
			const selected = options.find(
				(opt) => getOptionValue(opt) === optionValue
			)
			onChange?.((selected ?? null) as Multiple extends true ? T[] : T | null)
			setIsPopoverOpen(false)
		}
	}

	const onRemoveSelectedValue = (optionValue: string) => {
		if (multiple && Array.isArray(selectedValue)) {
			if (onSelectAll) {
				onSelectAll(false)
			}

			const newSelected = selectedValue.filter((v) => v !== optionValue)
			setSelectedValue(newSelected)
			onValueChange?.(
				newSelected as Multiple extends true ? string[] : string | null
			)

			const selectedOptions = options.filter((opt) =>
				newSelected.includes(getOptionValue(opt))
			)
			onChange?.(selectedOptions as Multiple extends true ? T[] : T | null)
		}
	}

	const onClearAllOptions = () => {
		const clearedStringValue = multiple ? [] : null
		const clearedTypedValue = multiple ? [] : null

		if (multiple && onSelectAll) {
			onSelectAll(false)
		}

		setSelectedValue(clearedStringValue)
		onValueChange?.(
			clearedStringValue as Multiple extends true ? string[] : string | null
		)
		onChange?.(clearedTypedValue as Multiple extends true ? T[] : T | null)

		setIsPopoverOpen(false)
	}

	const onSelectAllOptions = () => {
		if (!multiple) return

		const allSelected = Array.isArray(selectedValue) && selectedValue.length === options.length

		if (allSelected) {
			const emptyArray: string[] = []
			setSelectedValue(emptyArray)
			onValueChange?.(emptyArray as Multiple extends true ? string[] : string | null)

			const emptyOptions: T[] = []
			onChange?.(emptyOptions as Multiple extends true ? T[] : T | null)

			onSelectAll?.(false)
		} else {
			const allValues = options.map(opt => getOptionValue(opt))
			setSelectedValue(allValues)
			onValueChange?.(allValues as Multiple extends true ? string[] : string | null)
			onChange?.(options as Multiple extends true ? T[] : T | null)

			onSelectAll?.(true)
		}
	}

	React.useEffect(() => {
		if (multiple) {
			const newValue = Array.isArray(value)
				? value.map((v) => (typeof v === 'string' ? v : getOptionValue(v as T)))
				: []
			setSelectedValue(newValue)
		} else {
			const newValue =
				typeof value === 'string'
					? value
					: value
						? getOptionValue(value as T)
						: null
			setSelectedValue(newValue)
		}
	}, [isPopoverOpen, value, getOptionValue, multiple])

	return (
		<Popover
			open={isPopoverOpen}
			onOpenChange={setIsPopoverOpen}
		>
			<PopoverTrigger asChild>
				<InputSelectTrigger
					options={options}
					multiple={multiple}
					placeholder={placeholder}
					clearable={clearable}
					disabled={disabled}
					selectedValue={selectedValue}
					setSelectedValue={setSelectedValue}
					isPopoverOpen={isPopoverOpen}
					setIsPopoverOpen={setIsPopoverOpen}
					onOptionSelect={onOptionSelect}
					onRemoveSelectedValue={onRemoveSelectedValue}
					onClearAllOptions={onClearAllOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					limitTags={limitTags}
					className={classNameTrigger}
				/>
			</PopoverTrigger>
			<PopoverContent
				className={cn('w-auto p-0', className)}
				align="start"
				// portal={false}
				onEscapeKeyDown={() => setIsPopoverOpen(false)}
				{...restProps}
			>
				<Command
					shouldFilter={!async}
					filter={(value, searchTerm, keywords) => {
						const haystack = normalizeTextSearch(
							value + ' ' + (keywords || []).join(' ')
						)
						const needle = normalizeTextSearch(searchTerm)
						return haystack.includes(needle) ? 1 : 0
					}}
				>
					<CommandInput
						placeholder={searchMessage}
						value={search}
						onValueChange={(value) => {
							if (onSearch) {
								onSearch(value)
							}
						}}
					/>
					<CommandList className="max-h-[unset] overflow-y-hidden">
						<CommandEmpty>{noOptionsMessage}</CommandEmpty>
						{isLoading && (
							<div className="flex justify-center py-6 items-center h-full">
								<Icon
									name="loader2"
									className="animate-spin text-primary"
								/>
							</div>
						)}
						<CommandGroup className="max-h-[20rem] min-h-[10rem] overflow-y-auto">
							{multiple && selectAllOption && options.length > 0 && (
								<>
									<CommandItem
										onSelect={onSelectAllOptions}
										className="cursor-pointer"
									>
										<div className="cursor-pointer">
											<Checkbox
												checked={Array.isArray(selectedValue) && selectedValue.length === options.length}
												indeterminate={Array.isArray(selectedValue) && selectedValue.length > 0 && selectedValue.length < options.length}
											/>
										</div>
										<span>{selectAllMessage}</span>
									</CommandItem>
									<CommandSeparator />
								</>
							)}
							{options.map((option) => {
								const optionValue = getOptionValue(option)
								const isSelected = multiple
									? Array.isArray(selectedValue) &&
										selectedValue.includes(optionValue)
									: selectedValue === optionValue
								return (
									<CommandItem
										key={optionValue}
										onSelect={() => onOptionSelect(optionValue)}
										className="cursor-pointer"
									>
										{multiple && (
											<div className="cursor-pointer">
												<Checkbox checked={isSelected} />
											</div>
										)}
										{!multiple && (
											<div
												className={cn(
													'mr-1 flex h-4 w-4 items-center justify-center',
													isSelected ? 'text-primary' : 'invisible'
												)}
											>
												<Icon
													name="check"
													className="w-4 h-4"
												/>
											</div>
										)}
										<span>{getOptionLabel(option)}</span>
									</CommandItem>
								)
							})}
						</CommandGroup>
						<CommandSeparator />
						<CommandGroup>
							<div className="flex items-center justify-between">
								{((multiple &&
									Array.isArray(selectedValue) &&
									selectedValue.length > 0) ||
									(!multiple && selectedValue !== null)) &&
									clearable && (
										<>
											<CommandItem
												onSelect={onClearAllOptions}
												className="justify-center flex-1 cursor-pointer"
											>
												{clearMessage}
											</CommandItem>
											<Separator
												orientation="vertical"
												className="flex h-full mx-2 min-h-6"
											/>
										</>
									)}
								<CommandItem
									onSelect={() => setIsPopoverOpen(false)}
									className="justify-center flex-1 max-w-full cursor-pointer"
								>
									{closeMessage}
								</CommandItem>
							</div>
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
InputSelect.displayName = 'InputSelect'

const InputSelectTrigger = React.forwardRef<
	HTMLButtonElement,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	InputSelectProvided<any> & {
		multiple?: boolean
		className?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		children?: (selectedOption: any) => React.ReactNode
		style?: React.CSSProperties
	}
>(
	(
		{
			options,
			placeholder,
			clearable,
			disabled,
			selectedValue,
			setIsPopoverOpen,
			onClearAllOptions,
			className,
			style,
			children,
			getOptionLabel,
			getOptionValue,
			onRemoveSelectedValue,
			multiple = false,
			limitTags,
		},
		ref
	) => {
		const onTogglePopover = () => {
			setIsPopoverOpen((prev) => !prev)
		}

		const selectedOptions = React.useMemo(() => {
			if (multiple && Array.isArray(selectedValue)) {
				return options.filter((option) =>
					selectedValue.includes(getOptionValue(option))
				)
			}
			if (!multiple && typeof selectedValue === 'string') {
				return (
					options.find((option) => getOptionValue(option) === selectedValue) ??
					null
				)
			}
			return multiple ? [] : null
		}, [selectedValue, options, getOptionValue, multiple])

		return (
			<Button
				ref={ref}
				onClick={onTogglePopover}
				variant="outline"
				type="button"
				disabled={disabled}
				className={cn(
					'flex min-h-10 h-auto w-full items-center justify-between p-1 [&_svg]:pointer-events-auto',
					'bg-input-bg hover:bg-input-bg border border-input',
					disabled && '[&_svg]:pointer-events-none',
					className
				)}
				style={style}
			>
				{multiple ? (
					Array.isArray(selectedValue) && selectedValue.length > 0 ? (
						<div className="flex items-center w-full">
							<div className="flex-1 flex flex-wrap items-center px-2 gap-y-1 min-w-0 overflow-hidden">
								{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
								{selectedOptions.slice(0, limitTags).map((option: any) => (
									<Badge
										key={getOptionValue(option)}
										className="mr-1 border-transparent bg-muted text-foreground hover:bg-muted max-w-full overflow-hidden"
									>
										<span className='truncate overflow-hidden font-normal'>{getOptionLabel(option)}</span>
										<Icon
											name="x"
											className="ml-1 h-3.5 w-3.5 cursor-pointer text-muted-foreground hover:text-foreground flex-shrink-0"
											onClick={(e) => {
												e.stopPropagation()
												onRemoveSelectedValue?.(getOptionValue(option))
											}}
										/>
									</Badge>
								))}
								{selectedValue.length > limitTags && (
									<div className="cursor-default py-1 pl-1.5 text-muted-foreground font-normal">
										{`+${selectedValue.length - limitTags}`}
									</div>
								)}
							</div>
							<div className="flex items-center flex-shrink-0">
								{clearable && (
									<>
										<Icon
											name="x"
											className="mx-1 h-4 cursor-pointer text-muted-foreground"
											onClick={(e) => {
												e.stopPropagation()
												onClearAllOptions()
											}}
										/>
										<Separator
											orientation="vertical"
											className="flex h-full min-h-6"
										/>
									</>
								)}
								<Icon
									name="chevron-down"
									className="h-4 mx-1 cursor-pointer text-muted-foreground"
								/>
							</div>
						</div>
					) : (
						<div className="flex items-center justify-between w-full mx-auto">
							<span className="mx-3 text-sm text-muted-foreground font-normal">
								{placeholder}
							</span>
							<Icon
								name="chevron-down"
								className="h-4 mx-1 cursor-pointer text-muted-foreground"
							/>
						</div>
					)
				) : selectedValue !== null && selectedOptions ? (
					<div className="flex items-center w-full">
						<div className="flex-1 flex flex-wrap items-center px-2 min-w-0 overflow-hidden">
							{children ? (
								<div className="truncate max-w-full font-normal">
									{children(selectedOptions)}
								</div>
							) : (
								<div
									className={cn(
										'text-foreground truncate max-w-full overflow-hidden whitespace-nowrap font-normal'
									)}
								>
									{getOptionLabel(selectedOptions)}
								</div>
							)}
						</div>
						<div className="flex items-center flex-shrink-0">
							{clearable && (
								<>
									<Icon
										name="x"
										className={cn(
											'mx-1 h-4 cursor-pointer text-muted-foreground'
										)}
										onClick={(e) => {
											e.stopPropagation()
											onClearAllOptions()
										}}
									/>
									<Separator
										orientation="vertical"
										className="flex h-full min-h-6"
									/>
								</>
							)}
							<Icon
								name="chevron-down"
								className="h-4 mx-1 cursor-pointer text-muted-foreground"
							/>
						</div>
					</div>
				) : (
					<div className="flex items-center justify-between w-full mx-auto">
						<span className="mx-3 text-sm text-muted-foreground font-normal">
							{placeholder}
						</span>
						<Icon
							name="chevron-down"
							className="h-4 mx-1 cursor-pointer text-muted-foreground"
						/>
					</div>
				)}
			</Button>
		)
	}
)
InputSelectTrigger.displayName = 'InputSelectTrigger'
