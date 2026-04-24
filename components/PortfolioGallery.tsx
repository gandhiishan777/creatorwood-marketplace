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
  // For video embeds the url is an iframe src, not an image — only use thumbnail_url
  const imgSrc = item.thumbnail_url ?? (item.type !== "video_embed" ? item.url : null)

  // If there's no image to load, start in the loaded state so the shimmer never shows
  const [loaded, setLoaded] = useState(!imgSrc)
  const onLoad = useCallback(() => setLoaded(true), [])

  const altText = item.title ?? (creatorName ? `${creatorName}'s ${item.type === "video_embed" ? "video" : "work"}` : "Portfolio piece")

  if (item.type === "link") {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group relative block overflow-hidden rounded-xl border border-[#8B5CF6]/20 bg-[#0e0e10] transition-all duration-300 hover:border-[#8B5CF6]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] ${
          hero ? "aspect-[16/10] rounded-none" : "aspect-video"
        }`}
      >
        {/* Subtle violet tint background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 via-transparent to-[#6366f1]/5" />

        {/* Centered icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex size-12 items-center justify-center rounded-full border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 transition-all duration-300 group-hover:border-[#8B5CF6]/60 group-hover:bg-[#8B5CF6]/20">
            <ExternalLink className="size-5 text-[#8B5CF6]" />
          </div>
        </div>

        {/* Bottom gradient + title */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8">
          <p className="truncate text-sm font-medium text-white/90">
            {item.title || "External Link"}
          </p>
        </div>
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
      {!loaded && <div className="absolute inset-0 animate-shimmer" />}
      {imgSrc && (
        <img
          src={imgSrc}
          alt={altText}
          onLoad={onLoad}
          onError={onLoad}
          className={`size-full object-cover transition-all duration-300 group-hover:scale-105 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      )}

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

  // Show images/videos first; links are supplementary and go at the end
  const sorted = [...items].sort((a, b) =>
    a.type === "link" && b.type !== "link" ? 1
    : a.type !== "link" && b.type === "link" ? -1
    : 0
  )
  const [hero, ...rest] = sorted

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
