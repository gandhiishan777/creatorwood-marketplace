"use client"

import { useState, useTransition } from "react"
import { Heart } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { toggleSaveCreator } from "@/app/actions/saved"

interface SaveButtonProps {
  creatorId: string
  initialSaved: boolean
  size?: "sm" | "md"
}

export function SaveButton({
  creatorId,
  initialSaved,
  size = "sm",
}: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, startTransition] = useTransition()

  const sizeClass = size === "md" ? "size-9" : "size-7"
  const iconClass = size === "md" ? "size-4.5" : "size-3.5"

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const next = !saved
    setSaved(next)

    startTransition(async () => {
      const result = await toggleSaveCreator(creatorId)
      if (result.error) {
        setSaved(!next)
        toast.error(result.error)
      }
    })
  }

  return (
    <motion.button
      whileTap={{ scale: 0.85 }}
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Unsave creator" : "Save creator"}
      className={`${sizeClass} flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60 disabled:opacity-50`}
    >
      <Heart
        className={`${iconClass} transition-all duration-200 ${
          saved
            ? "fill-rose-500 text-rose-500 scale-110"
            : "fill-transparent text-white"
        }`}
      />
    </motion.button>
  )
}
