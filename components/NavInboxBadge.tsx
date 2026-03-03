"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

interface NavInboxBadgeProps {
  initialCount: number
  userId: string
}

export function NavInboxBadge({ initialCount, userId }: NavInboxBadgeProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("nav-inbox-badge")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const msg = payload.new as { sender_id: string }
          if (msg.sender_id !== userId) {
            setCount((prev) => prev + 1)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return (
    <Button variant="ghost" size="sm" asChild>
      <Link href="/inbox" className="relative flex items-center gap-1.5">
        Inbox
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex size-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold leading-none text-destructive-foreground"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </Link>
    </Button>
  )
}
