"use client"

import { AnimatePresence, motion } from "framer-motion"
import { TalentCard } from "@/components/TalentCard"

type Profile = {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  hourly_rate: number | null
  roles: string[] | null
}

interface TalentGridProps {
  profiles: Profile[]
}

export function TalentGrid({ profiles }: TalentGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {profiles.map((profile) => (
          <motion.div
            key={profile.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              duration: 0.25,
              type: "spring",
              stiffness: 300,
              damping: 25,
            }}
          >
            <TalentCard
              id={profile.id}
              display_name={profile.display_name}
              avatar_url={profile.avatar_url}
              roles={profile.roles}
              hourly_rate={profile.hourly_rate}
              bio={profile.bio}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
