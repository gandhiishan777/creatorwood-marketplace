"use client"

import { HireModal } from "@/components/HireModal"
import { usePresence } from "@/components/PresenceProvider"

interface GlowButtonProps {
  talentId: string
  talentName: string
}

export function GlowButton({ talentId, talentName }: GlowButtonProps) {
  return (
    <div className="relative w-full">
      {/* Glow layer behind the button */}
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-60 blur-md animate-glow" />
      <div className="relative">
        <HireModal talentId={talentId} talentName={talentName} glowing />
      </div>
    </div>
  )
}

export function AvailabilityDot() {
  return (
    <span className="relative flex size-2.5">
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
      <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
    </span>
  )
}

export function PresenceStatus({ userId }: { userId: string }) {
  const { onlineUsers, isActive } = usePresence()
  const isOnline = isActive && onlineUsers.has(userId)

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          </span>
          <span className="text-sm text-emerald-400 font-medium">Online Now</span>
        </>
      ) : (
        <>
          <span className="inline-flex size-2.5 rounded-full bg-zinc-500" />
          <span className="text-sm text-muted-foreground font-medium">Offline</span>
        </>
      )}
    </div>
  )
}
