"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { AIConciergeButton } from "@/components/AIConciergeButton"
import { AIConciergePanel } from "@/components/AIConciergePanel"
import type { TalentCardProfile } from "@/components/TalentCard"

interface AIConciergeProps {
  profiles: TalentCardProfile[]
}

export function AIConcierge({ profiles }: AIConciergeProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!open && <AIConciergeButton onClick={() => setOpen(true)} />}
      </AnimatePresence>
      <AIConciergePanel
        open={open}
        onOpenChange={setOpen}
        profiles={profiles}
      />
    </>
  )
}
