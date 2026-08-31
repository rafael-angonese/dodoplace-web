import { Link } from '@tanstack/react-router'
import { Zap } from 'lucide-react'

import { cn } from '@/utils/cn'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="FazPerto"
      className={cn(
        'inline-flex items-center gap-1 font-extrabold tracking-tight',
        className,
      )}
    >
      <span>FazPerto</span>
      <Zap
        aria-hidden="true"
        className="size-5 fill-brand-yellow text-brand-yellow-strong"
      />
    </Link>
  )
}
