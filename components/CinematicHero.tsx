"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CinematicPresenceStatus } from "@/components/ProfileHero"
import { SaveButton } from "@/components/SaveButton"
import { getInitials } from "@/lib/utils"

interface CinematicHeroProps {
  displayName: string
  primaryRole?: string
  roles?: string[]
  heroImage: string | null
  avatarUrl: string | null
  userId: string
  isSaved: boolean
  isAuthenticated: boolean
  hourlyRate?: number | null
}

export function CinematicHero({
  displayName,
  primaryRole,
  roles,
  heroImage,
  avatarUrl,
  userId,
  isSaved,
  isAuthenticated,
  hourlyRate,
}: CinematicHeroProps) {
  return (
    <section className="relative h-[65vh] min-h-[480px] w-full overflow-hidden">
      {/* Background image or gradient */}
      {heroImage ? (
        <img
          src={heroImage}
          alt={`${displayName}'s featured work`}
          className="absolute inset-0 size-full object-cover animate-[ken-burns_25s_ease-in-out_infinite]"
        />
      ) : (
        <div className="absolute inset-0 hero-gradient-brand" />
      )}

      {/* Atmospheric violet/indigo glow orbs */}
      <div
        className="pointer-events-none absolute -top-32 left-1/4 h-96 w-96 rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, #8B5CF6 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          filter: "blur(50px)",
        }}
      />

      {/* Gradient overlay: stronger dark ramp from bottom two-thirds up */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#131315] via-[#131315]/70 to-transparent" />

      {/* Bottom-left: name, roles, rate, avatar, presence, save */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
          {/* Name + meta */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mb-4"
          >
            <h1 className="font-display text-5xl tracking-tight text-white md:text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.25)]">
              {displayName}
            </h1>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="mt-3 flex flex-wrap items-center gap-2"
            >
              {roles && roles.length > 0 && roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className="border-white/20 bg-white/10 text-white backdrop-blur-sm text-sm px-3 py-1"
                >
                  {role}
                </Badge>
              ))}
              {hourlyRate != null && (
                <span className="text-sm text-white/60">
                  <span className="font-semibold text-white/90">${hourlyRate}</span>/hr
                </span>
              )}
            </motion.div>
          </motion.div>

          {/* Avatar + presence + save */}
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0 ring-2 ring-white/20 shadow-xl">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-sm bg-black/40 text-white">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <CinematicPresenceStatus userId={userId} />
            <SaveButton creatorId={userId} initialSaved={isSaved} size="md" />
          </div>
        </div>
      </div>

    </section>
  )
}
