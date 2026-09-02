import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { ChatUser } from '@/lib/chat'
import { cn } from '@/utils/cn'

export function ChatAvatar({
  user,
  isOnline,
  className,
}: {
  user?: ChatUser
  isOnline?: boolean
  className?: string
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar className={cn('size-11', className)}>
        {user?.avatarUrl ? (
          <AvatarImage
            src={user.avatarUrl}
            alt={user.name ?? ''}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-brand-yellow text-sm font-extrabold text-[#202124]">
          {user?.initials ?? '?'}
        </AvatarFallback>
      </Avatar>

      {isOnline ? (
        <span
          aria-hidden="true"
          className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-background bg-success"
        />
      ) : null}
    </span>
  )
}
