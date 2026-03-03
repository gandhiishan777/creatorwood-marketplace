"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { scaleIn } from "@/lib/motion"

interface AIConciergeButtonProps {
  onClick: () => void
}

export function AIConciergeButton({ onClick }: AIConciergeButtonProps) {
  return (
    <motion.button
      {...scaleIn}
      onClick={onClick}
      aria-label="Ask AI"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-brand px-4 py-3 font-medium text-brand-foreground shadow-lg animate-glow transition-transform hover:scale-105 active:scale-95 sm:px-5"
    >
      <Sparkles className="size-5" />
      <span className="hidden sm:inline text-sm">Ask AI</span>
    </motion.button>
  )
}
