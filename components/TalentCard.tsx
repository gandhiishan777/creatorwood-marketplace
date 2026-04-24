"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { SaveButton } from "@/components/SaveButton"
import { getInitials } from "@/lib/utils"

export interface TalentCardProfile {
  id: string
  display_name: string
  avatar_url: string | null
  roles: string[] | null
  hourly_rate: number | null
  portfolio_thumbnails: string[]
  avg_rating: number | null
  review_count: number
  isSaved?: boolean
}

interface TalentCardProps extends TalentCardProfile {
  aspectClass?: string
}

const DEFAULT_ASPECT = "aspect-[3/4]"

function ThumbnailCycler({
  thumbnails,
  displayName,
}: {
  thumbnails: string[]
  displayName: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startCycling = useCallback(() => {
    if (thumbnails.length <= 1) return
    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % thumbnails.length)
    }, 1500)
  }, [thumbnails.length])

  const stopCycling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setActiveIndex(0)
  }, [])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  if (thumbnails.length === 0) {
    return (
      <div className="flex size-full items-center justify-center bg-gradient-to-br from-[#1a1a1d] via-[#141416] to-[#1a1a1d]">
        <span className="font-display text-4xl text-white/20 select-none">
          {getInitials(displayName)}
        </span>
      </div>
    )
  }

  return (
    <div
      className="relative size-full"
      onMouseEnter={startCycling}
      onMouseLeave={stopCycling}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={thumbnails[activeIndex]}
          src={thumbnails[activeIndex]}
          alt={`${displayName}'s work`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="size-full object-cover"
        />
      </AnimatePresence>
    </div>
  )
}

export function TalentCard({
  id,
  display_name,
  avatar_url: _avatar_url,
  roles,
  hourly_rate: _hourly_rate,
  portfolio_thumbnails,
  avg_rating,
  review_count,
  isSaved = false,
  aspectClass = DEFAULT_ASPECT,
}: TalentCardProps) {
  const primaryRole = roles?.[0]
  const isCurated = avg_rating != null && avg_rating >= 4.8 && review_count > 0

  return (
    <Link href={`/profile/${id}`} className="group block">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#131315] transition-all duration-300 group-hover:border-[#8B5CF6]/40 group-hover:shadow-[0_0_28px_rgba(139,92,246,0.18)]">
        {/* Thumbnail */}
        <div className={`relative overflow-hidden bg-[#0e0e10] ${aspectClass}`}>
          <ThumbnailCycler
            thumbnails={portfolio_thumbnails}
            displayName={display_name}
          />

          {/* Subtle bottom gradient for legibility of any overlay state */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#131315]/70 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Curated badge — top right */}
          {isCurated && (
            <div className="absolute right-2.5 top-2.5 z-10 pointer-events-none">
              <span className="rounded-full border border-[#8B5CF6]/40 bg-[#8B5CF6]/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#d0bcff] backdrop-blur-md">
                Curated
              </span>
            </div>
          )}

          {/* Save — top left, appears on hover */}
          <div className="absolute left-2.5 top-2.5 z-10 opacity-0 transition-opacity duration-200 group-hover:opacity-100 max-sm:opacity-100">
            <SaveButton creatorId={id} initialSaved={isSaved} size="sm" />
          </div>
        </div>

        {/* Identity — minimal */}
        <div className="px-3.5 py-3">
          <p className="truncate font-display text-lg leading-tight text-white">
            {display_name}
          </p>
          {primaryRole && (
            <p className="mt-0.5 truncate text-xs text-white/50">
              {primaryRole}
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
