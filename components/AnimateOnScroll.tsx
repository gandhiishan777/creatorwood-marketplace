"use client"

import { motion } from "framer-motion"
import { fadeUp, MOTION } from "@/lib/motion"
import type { PropsWithChildren } from "react"

export function AnimateOnScroll({
  children,
  delay = 0,
  className,
}: PropsWithChildren<{ delay?: number; className?: string }>) {
  return (
    <motion.div
      initial={fadeUp.initial}
      whileInView={fadeUp.animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ ...MOTION.duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
