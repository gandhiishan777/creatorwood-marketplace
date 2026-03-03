"use client"

import { useEffect, useRef } from "react"
import { markConnectionRead } from "@/app/actions/inbox"

export function MarkReadOnMount({ connectionId }: { connectionId: string }) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    markConnectionRead(connectionId)
  }, [connectionId])

  return null
}
