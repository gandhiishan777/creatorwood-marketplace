"use client"

import { usePresence } from "@/components/PresenceProvider"

interface PresenceIndicatorProps {
  userId: string
  size?: "sm" | "md"
}

export function PresenceIndicator({ userId, size = "sm" }: PresenceIndicatorProps) {
  const { onlineUsers, isActive } = usePresence()
  const isOnline = isActive && onlineUsers.has(userId)

  const sizeClass = size === "sm" ? "size-2" : "size-2.5"

  if (isOnline) {
    return (
      <span role="status" aria-label="Online" className={`relative flex ${sizeClass}`}>
        <span
          className={`absolute inline-flex ${sizeClass} animate-ping rounded-full bg-emerald-400 opacity-75`}
        />
        <span
          className={`relative inline-flex ${sizeClass} rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]`}
        />
      </span>
    )
  }

  return (
    <span
      role="status"
      aria-label="Offline"
      className={`inline-flex ${sizeClass} rounded-full bg-zinc-500`}
    />
  )
}
