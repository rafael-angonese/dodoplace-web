import { Link } from '@tanstack/react-router'

import { cn } from '@/utils/cn'

const LOGO_LIGHT = '/brand/dodoplace-logo.png'
const LOGO_DARK = '/brand/dodoplace-logo-negativa.png'
const SYMBOL = '/brand/dodoplace-symbol.png'
const SYMBOL_DARK = '/brand/dodoplace-symbol-negativa.png'

export function LogoMark({
  className,
  alt = '',
  onDark = false,
}: {
  className?: string
  alt?: string
  onDark?: boolean
}) {
  return (
    <img
      src={onDark ? SYMBOL_DARK : SYMBOL}
      alt={alt}
      aria-hidden={alt === '' ? true : undefined}
      className={cn('h-9 w-auto shrink-0 self-start select-none', className)}
    />
  )
}

export function LogoLockup({
  className,
  onDark = false,
  variant = 'auto',
}: {
  className?: string
  onDark?: boolean
  variant?: 'auto' | 'principal' | 'negativa'
}) {
  if (onDark || variant === 'negativa') {
    return (
      <img
        src={LOGO_DARK}
        alt="DodoPlace"
        className={cn('h-8 w-auto shrink-0 self-start select-none', className)}
      />
    )
  }

  if (variant === 'principal') {
    return (
      <img
        src={LOGO_LIGHT}
        alt="DodoPlace"
        className={cn('h-8 w-auto shrink-0 self-start select-none', className)}
      />
    )
  }

  return (
    <>
      <img
        src={LOGO_LIGHT}
        alt="DodoPlace"
        className={cn('h-8 w-auto shrink-0 self-start select-none dark:hidden', className)}
      />
      <img
        src={LOGO_DARK}
        alt="DodoPlace"
        className={cn('hidden h-8 w-auto shrink-0 self-start select-none dark:block', className)}
      />
    </>
  )
}

export function Logo({
  className,
  onDark = false,
}: {
  className?: string
  onDark?: boolean
}) {
  return (
    <Link
      to="/"
      aria-label="DodoPlace"
      className="inline-flex shrink-0 items-center rounded-lg"
    >
      <LogoLockup className={className} onDark={onDark} />
    </Link>
  )
}
