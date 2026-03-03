"use client"

import { HireModal } from "@/components/HireModal"
import { usePresence } from "@/components/PresenceProvider"

interface GlowButtonProps {
  talentId: string
  talentName: string
  isAuthenticated: boolean
}

export function GlowButton({ talentId, talentName, isAuthenticated }: GlowButtonProps) {
  return (
    <div className="relative w-full">
      <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-60 blur-md animate-glow" />
      <div className="relative">
        <HireModal talentId={talentId} talentName={talentName} glowing isAuthenticated={isAuthenticated} />
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
          <span className="text-sm text-white/60 font-medium">Offline</span>
        </>
      )}
    </div>
  )
}

export function CinematicPresenceStatus({ userId }: { userId: string }) {
  const { onlineUsers, isActive } = usePresence()
  const isOnline = isActive && onlineUsers.has(userId)

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <>
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">Online Now</span>
        </>
      ) : (
        <>
          <span className="inline-flex size-2 rounded-full bg-white/40" />
          <span className="text-xs font-medium text-white/50">Offline</span>
        </>
      )}
    </div>
  )
}
