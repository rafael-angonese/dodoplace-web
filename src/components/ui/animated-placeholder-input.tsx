import { Search } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'

import { cn } from '@/utils/cn'

const ROTATION_MS = 3000

export function AnimatedPlaceholderInput({
	placeholders,
	label,
	labelHidden = false,
	value,
	onChange,
	onSubmit,
	className,
}: {
	placeholders: string[]
	label: string
	labelHidden?: boolean
	value: string
	onChange: (value: string) => void
	onSubmit: (value: string) => void
	className?: string
}) {
	const [currentPlaceholder, setCurrentPlaceholder] = useState(0)

	useEffect(() => {
		if (placeholders.length < 2) {
			return
		}

		let interval: ReturnType<typeof setInterval> | null = null

		function start() {
			interval = setInterval(() => {
				setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length)
			}, ROTATION_MS)
		}

		function stop() {
			if (interval) {
				clearInterval(interval)
				interval = null
			}
		}

		function onVisibilityChange() {
			if (document.visibilityState === 'visible') {
				start()
			} else {
				stop()
			}
		}

		start()
		document.addEventListener('visibilitychange', onVisibilityChange)

		return () => {
			stop()
			document.removeEventListener('visibilitychange', onVisibilityChange)
		}
	}, [placeholders])

	function submit(event: React.FormEvent) {
		event.preventDefault()
		onSubmit(value.trim())
	}

	return (
		<form
			onSubmit={submit}
			className={cn(
				'rounded-full border border-border bg-card p-2 text-card-foreground shadow-md transition-shadow hover:shadow-lg',
				className,
			)}
		>
			<div className="flex items-center gap-1 rounded-full pr-1 transition-colors hover:bg-accent/50">
				<label
					className={cn(
						'flex w-full min-w-0 flex-col justify-center px-5',
						labelHidden ? 'py-1.5' : 'py-2',
					)}
				>
					<span
						className={cn(
							'font-display text-[11px] font-bold tracking-wide',
							labelHidden && 'sr-only',
						)}
					>
						{label}
					</span>

					<span className="relative block">
						<input
							type="text"
							value={value}
							onChange={(event) => onChange(event.target.value)}
							className="relative z-10 w-full bg-transparent text-sm focus-visible:outline-none!"
						/>

						<AnimatePresence mode="wait">
							{value ? null : (
								<motion.span
									key={currentPlaceholder}
									initial={{ y: 5, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -15, opacity: 0 }}
									transition={{ duration: 0.3, ease: 'linear' }}
									className="pointer-events-none absolute inset-0 flex items-center text-sm text-muted-foreground"
								>
									<span className="w-full truncate">
										{placeholders[currentPlaceholder]}
									</span>
								</motion.span>
							)}
						</AnimatePresence>
					</span>
				</label>

				<button
					type="submit"
					className="grid size-11 shrink-0 place-items-center rounded-full bg-dodo-orange text-dodo-blue-deep transition hover:bg-dodo-orange-strong"
				>
					<Search aria-hidden="true" className="size-4" />
					<span className="sr-only">Buscar</span>
				</button>
			</div>
		</form>
	)
}
