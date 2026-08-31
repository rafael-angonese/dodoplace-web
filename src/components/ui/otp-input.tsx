import * as React from 'react'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

type OtpInputProps = {
	length?: number
	value?: string
	onChange?: (value: string) => void
	onComplete?: (value: string) => void
	error?: boolean
	disabled?: boolean
	containerClassName?: string
	className?: string
}

export function OtpInput({
	length = 6,
	value,
	onChange,
	onComplete,
	error = false,
	disabled = false,
	containerClassName,
	className,
}: OtpInputProps) {
	const [internalOtp, setInternalOtp] = React.useState<string[]>(
		Array(length).fill('')
	)

	const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

	const otp = React.useMemo(() => {
		if (value !== undefined) {
			return value
				.split('')
				.slice(0, length)
				.concat(Array(Math.max(0, length - value.length)).fill(''))
		}
		return internalOtp
	}, [value, internalOtp, length])

	function handleChange(index: number, inputValue: string) {
		if (disabled) return

		const newOtp = [...otp]
		newOtp[index] = inputValue.toUpperCase()

		if (onChange) {
			onChange(newOtp.join(''))
		} else {
			setInternalOtp(newOtp)
		}

		if (inputValue && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}

		if (newOtp.every((digit) => digit !== '') && onComplete) {
			onComplete(newOtp.join(''))
		}
	}

	function handleKeyDown(
		index: number,
		e: React.KeyboardEvent<HTMLInputElement>
	) {
		if (disabled) return

		if (e.key === 'Backspace' && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}

		if (e.key === 'ArrowRight' && index < length - 1) {
			inputRefs.current[index + 1]?.focus()
		}

		if (e.key === 'ArrowLeft' && index > 0) {
			inputRefs.current[index - 1]?.focus()
		}
	}

	function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
		if (disabled) return

		e.preventDefault()
		const pasted = e.clipboardData
			.getData('text/plain')
			.slice(0, length)
			.toUpperCase()

		const newOtp = [...otp]
		pasted.split('').forEach((char, index) => {
			if (index < length) {
				newOtp[index] = char
			}
		})

		if (onChange) {
			onChange(newOtp.join(''))
		} else {
			setInternalOtp(newOtp)
		}

		const nextEmptyIndex = newOtp.findIndex((digit) => digit === '')
		const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
		inputRefs.current[focusIndex]?.focus()

		if (newOtp.every((digit) => digit !== '') && onComplete) {
			onComplete(newOtp.join(''))
		}
	}

	return (
		<div
			className={cn(
				'flex items-stretch rounded-md border bg-background transition',
				error
					? 'border-destructive'
					: 'border-input focus-within:ring-2 focus-within:ring-ring/20',
				disabled && 'opacity-50 cursor-not-allowed',
				containerClassName
			)}
		>
			{otp.map((digit, index) => (
				<Input
					key={index}
					ref={(el) => {
						inputRefs.current[index] = el
					}}
					value={digit}
					disabled={disabled}
					maxLength={1}
					type="text"
					inputMode="text"
					autoComplete="one-time-code"
					aria-label={`Digit ${index + 1} of ${length}`}
					onChange={(e) => handleChange(index, e.target.value)}
					onKeyDown={(e) => handleKeyDown(index, e)}
					onPaste={handlePaste}
					className={cn(
						'h-10 w-10 rounded-none border-0 border-r text-center font-mono text-base',
						'focus-visible:ring-0',
						index === length - 1 && 'border-r-0',
						className
					)}
				/>
			))}
		</div>
	)
}
