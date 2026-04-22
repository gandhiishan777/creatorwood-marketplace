'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import LandingSections from './LandingSections'

const HeroStage = dynamic(() => import('./HeroStage'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#050505',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase' as const,
            color: 'rgba(255,255,255,0.5)',
            marginBottom: 20,
          }}
        >
          The AI creator marketplace
        </div>
        <div
          style={{
            fontFamily: 'var(--font-display), "Instrument Serif", serif',
            fontSize: 'clamp(48px, 8vw, 84px)',
            fontWeight: 400,
            lineHeight: 0.98,
            letterSpacing: '-0.02em',
          }}
        >
          The world&apos;s best
          <br />
          <em style={{ color: '#eadfff' }}>AI creators.</em>
        </div>
      </div>
    </div>
  ),
})

export interface Creator {
  id: string
  display_name: string
  avatar_url: string | null
  roles: string[] | null
  hourly_rate: number | null
  thumbnail_url: string | null
  online?: boolean
}

interface LandingPageProps {
  portfolioImages: string[]
  creators: Creator[]
}

export default function LandingPage({ portfolioImages, creators }: LandingPageProps) {
  const [shattered, setShattered] = useState(false)
  const [heroGone, setHeroGone]   = useState(false)

  // The 250vh tall scroll container — HeroStage uses this as the ScrollTrigger target.
  const heroScrollerRef = useRef<HTMLDivElement>(null)

  // Lock scroll until the user completes the 3-click shatter sequence.
  useEffect(() => {
    if (shattered) return

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow             = 'hidden'

    const forceTop  = () => window.scrollTo(0, 0)
    forceTop()

    const prevent   = (e: Event) => { e.preventDefault(); e.stopPropagation(); forceTop() }
    const blockKeys = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(e.key)) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('wheel',     prevent,   { passive: false, capture: true })
    window.addEventListener('touchmove', prevent,   { passive: false, capture: true })
    window.addEventListener('scroll',    forceTop,  { passive: true })
    window.addEventListener('keydown',   blockKeys, { capture: true })

    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow             = ''
      window.removeEventListener('wheel',     prevent   as EventListener, true)
      window.removeEventListener('touchmove', prevent   as EventListener, true)
      window.removeEventListener('scroll',    forceTop)
      window.removeEventListener('keydown',   blockKeys, true)
    }
  }, [shattered])

  const handleShattered = useCallback(() => {
    setShattered(true)
    document.documentElement.style.overflow = ''
    document.body.style.overflow             = ''
  }, [])

  const handleHeroGone = useCallback(() => {
    setHeroGone(true)
  }, [])

  // Use creator thumbnails for hero cards so they visually match the grid below.
  const heroImages = creators.slice(0, 8).map(
    (c, i) => c.thumbnail_url ?? portfolioImages[i] ?? portfolioImages[0] ?? ''
  )
  const resolvedImages = heroImages.length >= 8 ? heroImages : portfolioImages.slice(0, 8)

  return (
    <div style={{ background: '#0a0a0a' }}>
      {/*
        250vh tall scroll container.
        The inner sticky div holds the canvas at 100vh while the container
        scrolls 150vh worth of scroll travel behind it — that 150vh is what
        GSAP ScrollTrigger maps to the card flight animation.
      */}
      <div
        ref={heroScrollerRef}
        style={{ height: '250vh', position: 'relative' }}
      >
        <div style={{ position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }}>
          <HeroStage
            images={resolvedImages}
            onShattered={handleShattered}
            onHeroGone={handleHeroGone}
            scrollerRef={heroScrollerRef}
          />
        </div>
      </div>

      {/* Creator sections start immediately after — no gap. */}
      <LandingSections creators={creators} heroGone={heroGone} />
    </div>
  )
}
