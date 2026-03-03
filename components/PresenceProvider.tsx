"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

interface PresenceContextValue {
  onlineUsers: Set<string>
  isActive: boolean
}

const PresenceContext = createContext<PresenceContextValue>({
  onlineUsers: new Set(),
  isActive: false,
})

export function usePresence(): PresenceContextValue {
  return useContext(PresenceContext)
}

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set())
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | null = null
    let aborted = false

    async function setup() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      // Anonymous visitors: don't subscribe, leave state as empty/inactive
      if (!user || aborted) return

      channel = supabase.channel("online-users", {
        config: { presence: { key: user.id } },
      })

      channel
        .on("presence", { event: "sync" }, () => {
          if (!channel) return
          const state = channel.presenceState()
          setOnlineUsers(new Set(Object.keys(state)))
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && channel && !aborted) {
            await channel.track({ online_at: new Date().toISOString() })
            setIsActive(true)
          }
        })
    }

    setup()

    return () => {
      aborted = true
      if (channel) {
        channel.untrack().then(() => {
          supabase.removeChannel(channel!)
        })
      }
      setIsActive(false)
    }
  }, [])

  return (
    <PresenceContext.Provider value={{ onlineUsers, isActive }}>
      {children}
    </PresenceContext.Provider>
  )
}
