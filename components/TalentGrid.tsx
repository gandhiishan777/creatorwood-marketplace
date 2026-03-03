"use client"

import { AnimatePresence, motion } from "framer-motion"
import { TalentCard, type TalentCardProfile } from "@/components/TalentCard"
import { scaleIn } from "@/lib/motion"

interface TalentGridProps {
  profiles: TalentCardProfile[]
}

export function TalentGrid({ profiles }: TalentGridProps) {
  const featured = profiles.slice(0, 2)
  const rest = profiles.slice(2)

  return (
    <div className="flex flex-col gap-5">
      {/* Featured row — 2 large cards */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {featured.map((profile) => (
              <motion.div
                key={profile.id}
                layout
                {...scaleIn}
              >
                <TalentCard {...profile} featured />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Standard grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {rest.map((profile) => (
              <motion.div
                key={profile.id}
                layout
                {...scaleIn}
              >
                <TalentCard {...profile} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
