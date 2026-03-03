"use client"

import { AnimatePresence, motion } from "framer-motion"
import { TalentCard, type TalentCardProfile } from "@/components/TalentCard"

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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
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
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, type: "spring", stiffness: 300, damping: 25 }}
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
