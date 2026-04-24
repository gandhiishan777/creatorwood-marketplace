"use client"

import { motion } from "framer-motion"
import { TalentCard, type TalentCardProfile } from "@/components/TalentCard"

interface TalentGridProps {
  profiles: TalentCardProfile[]
}

// Cycle of aspect ratios to create a true masonry rhythm
const ASPECTS = [
  "aspect-[3/4]",
  "aspect-[4/5]",
  "aspect-[4/3]",
  "aspect-[3/4]",
  "aspect-[1/1]",
  "aspect-[4/5]",
  "aspect-[3/4]",
  "aspect-[4/3]",
]

export function TalentGrid({ profiles }: TalentGridProps) {
  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5 [&>*]:mb-4 [&>*]:break-inside-avoid">
      {profiles.map((profile, i) => (
        <motion.div
          key={profile.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.4,
            delay: Math.min(i * 0.03, 0.4),
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <TalentCard {...profile} aspectClass={ASPECTS[i % ASPECTS.length]} />
        </motion.div>
      ))}
    </div>
  )
}
