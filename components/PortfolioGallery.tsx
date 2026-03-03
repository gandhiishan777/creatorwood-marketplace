"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, Play, X } from "lucide-react"
import { MOTION } from "@/lib/motion"
import type { Tables } from "@/types/supabase"

type PortfolioItem = Tables<"portfolio_items">

interface PortfolioGalleryProps {
  items: PortfolioItem[]
  creatorName?: string
}

function Lightbox({
  item,
  onClose,
}: {
  item: PortfolioItem
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
    document.body.style.overflow = "hidden"

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={item.title ?? "Portfolio piece lightbox"}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close lightbox"
        className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        <X className="size-5" />
      </button>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={MOTION.spring}
        className="w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === "video_embed" ? (
          <div className="aspect-video w-full overflow-hidden rounded-xl">
            <iframe
              src={item.url}
              title={item.title ?? "Video"}
              className="size-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <img
            src={item.url}
            alt={item.title ?? "Portfolio piece"}
            className="max-h-[85vh] w-full rounded-xl object-contain"
          />
        )}
        {item.title && (
          <p className="mt-3 text-center text-sm font-medium text-white/80">
            {item.title}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}

function GalleryItem({
  item,
  onClick,
  hero,
  creatorName,
}: {
  item: PortfolioItem
  onClick: () => void
  hero?: boolean
  creatorName?: string
}) {
  const [loaded, setLoaded] = useState(false)
  const onLoad = useCallback(() => setLoaded(true), [])

  const altText = item.title ?? (creatorName ? `${creatorName}'s ${item.type === "video_embed" ? "video" : "work"}` : "Portfolio piece")

  if (item.type === "link") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-border hover:bg-accent/50"
      >
        <ExternalLink className="size-5 text-muted-foreground transition-colors group-hover:text-foreground" />
        <span className="text-sm font-medium">{item.title || "External Link"}</span>
        <span className="text-xs text-muted-foreground">
          {(() => {
            try {
              return new URL(item.url).hostname
            } catch {
              return item.url
            }
          })()}
        </span>
      </a>
    )
  }

  return (
    <motion.button
      whileHover={{ scale: hero ? 1 : 1.02 }}
      transition={MOTION.spring}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden ${
        hero ? "aspect-[16/10] rounded-none" : item.type === "video_embed" ? "aspect-video rounded-xl" : "rounded-xl"
      }`}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-shimmer" />
      )}
      <img
        src={item.thumbnail_url ?? item.url}
        alt={altText}
        onLoad={onLoad}
        className={`size-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
      />

      {item.type === "video_embed" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110">
            <Play className="size-6 fill-white text-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Persistent gradient on hero, hover-only on others */}
      <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${hero ? "opacity-40 group-hover:opacity-70" : "opacity-0 group-hover:opacity-100"}`} />
      {item.title && (
        <p className={`absolute bottom-3 left-3 right-3 truncate text-sm font-medium text-white transition-opacity duration-300 ${hero ? "opacity-80 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
          {item.title}
        </p>
      )}
    </motion.button>
  )
}

export function PortfolioGallery({ items, creatorName }: PortfolioGalleryProps) {
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-16 text-center">
        <p className="text-sm text-muted-foreground italic">
          This creator hasn&apos;t added portfolio pieces yet.
        </p>
      </div>
    )
  }

  const [hero, ...rest] = items

  return (
    <>
      <div className="flex flex-col gap-3 overflow-hidden rounded-2xl">
        {/* Hero piece — full width, dramatic */}
        <GalleryItem
          item={hero}
          hero
          creatorName={creatorName}
          onClick={() => hero.type !== "link" && setLightboxItem(hero)}
        />

        {/* Remaining items in CSS columns masonry */}
        {rest.length > 0 && (
          <div className="columns-2 gap-3 px-1 [&>*]:mb-3 [&>*]:break-inside-avoid">
            {rest.map((item) => (
              <GalleryItem
                key={item.id}
                item={item}
                creatorName={creatorName}
                onClick={() => item.type !== "link" && setLightboxItem(item)}
              />
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {lightboxItem && (
          <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />
        )}
      </AnimatePresence>
    </>
  )
}
