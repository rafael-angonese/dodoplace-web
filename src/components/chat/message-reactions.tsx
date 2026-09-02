import { SmilePlus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { MESSAGE_REACTIONS, type MessageReaction } from '@/lib/chat'
import { cn } from '@/utils/cn'

export type ReactionGroup = {
  emoji: string
  count: number
  reactedByMe: boolean
}

export function groupReactions(
  reactions: MessageReaction[],
  currentUserId: number | undefined,
) {
  const groups = new Map<string, ReactionGroup>()

  for (const reaction of reactions) {
    const group = groups.get(reaction.emoji) ?? {
      emoji: reaction.emoji,
      count: 0,
      reactedByMe: false,
    }

    group.count += 1
    group.reactedByMe = group.reactedByMe || reaction.userId === currentUserId
    groups.set(reaction.emoji, group)
  }

  return [...groups.values()]
}

export function ReactionChips({
  groups,
  onToggle,
}: {
  groups: ReactionGroup[]
  onToggle: (emoji: string) => void
}) {
  if (groups.length === 0) {
    return null
  }

  return (
    <div className="mt-1 flex flex-wrap gap-1">
      {groups.map((group) => (
        <button
          key={group.emoji}
          type="button"
          onClick={() => onToggle(group.emoji)}
          className={cn(
            'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
            group.reactedByMe
              ? 'border-primary bg-primary/10 text-foreground'
              : 'border-border bg-background text-muted-foreground hover:bg-accent',
          )}
        >
          <span aria-hidden="true">{group.emoji}</span>
          <span>{group.count}</span>
        </button>
      ))}
    </div>
  )
}

export function ReactionPicker({
  onSelect,
}: {
  onSelect: (emoji: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 rounded-full"
          aria-label="Reagir à mensagem"
        >
          <SmilePlus aria-hidden="true" className="size-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-auto p-1" align="center">
        <div className="flex gap-0.5">
          {MESSAGE_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Reagir com ${emoji}`}
              className="rounded-md px-1.5 py-1 text-lg transition-transform hover:scale-125"
              onClick={() => {
                onSelect(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
