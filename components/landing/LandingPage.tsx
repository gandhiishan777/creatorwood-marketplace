'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import LandingSections from './LandingSections'

gsap.registerPlugin(ScrollTrigger)

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

// ─── Falling images cascade that fills the gap between hero and Section 1 ────

const FALLBACK_CASCADE = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&q=75',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=75',
  'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=600&q=75',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=75',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=75',
  'https://images.unsplash.com/photo-1493514789931-586cb221d7a7?w=600&q=75',
  'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=600&q=75',
]

// Pre-defined scattered positions for the cascade images.
// Each image starts above the section (negative y%) and falls down as you scroll.
const CASCADE_LAYOUT = [
  { left: '5%',  startY: -10, speed: 1.0,  rotate: -6,  width: 260, delay: 0 },
  { left: '72%', startY: -5,  speed: 0.7,  rotate: 4,   width: 300, delay: 0.05 },
  { left: '30%', startY: -18, speed: 1.2,  rotate: -3,  width: 240, delay: 0.1 },
  { left: '85%', startY: -25, speed: 0.9,  rotate: 7,   width: 220, delay: 0.15 },
  { left: '50%', startY: -8,  speed: 0.8,  rotate: -5,  width: 280, delay: 0.08 },
  { left: '15%', startY: -30, speed: 1.1,  rotate: 3,   width: 250, delay: 0.2 },
  { left: '60%', startY: -15, speed: 0.75, rotate: -8,  width: 230, delay: 0.12 },
  { left: '40%', startY: -22, speed: 1.05, rotate: 5,   width: 270, delay: 0.18 },
]

function CascadeSection({ images }: { images: string[] }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRefs = useRef<(HTMLDivElement | null)[]>([])

  const resolvedImages = images.length >= 8
    ? images.slice(0, 8)
    : FALLBACK_CASCADE.slice(0, 8)

  useEffect(() => {
    if (!sectionRef.current) return

    const triggers: ScrollTrigger[] = []

    imageRefs.current.forEach((el, i) => {
      if (!el) return
      const layout = CASCADE_LAYOUT[i]

      // Each image falls downward as you scroll through the section.
      // speed multiplier controls how far each image travels (parallax).
      const travelDistance = 120 * layout.speed // vh units worth of travel

      gsap.set(el, {
        y: `${layout.startY}vh`,
        rotation: layout.rotate,
        opacity: 0,
      })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',  // start when section enters viewport from below
          end: 'bottom top',    // end when section leaves viewport above
          scrub: 0.4,
          onUpdate: (self) => {
            // Store for cleanup
            if (!triggers.includes(self)) triggers.push(self)
          },
        },
      })

      // Fade in, fall down, then fade out near the end
      tl.to(el, {
        y: `${travelDistance}vh`,
        rotation: layout.rotate * 0.3, // rotation settles
        ease: 'none',
        duration: 1,
      }, 0)

      // Opacity: fade in during first 20%, full during middle, fade out last 30%
      tl.fromTo(el,
        { opacity: 0 },
        { opacity: 0.85, ease: 'power2.out', duration: 0.2 },
        0,
      )
      tl.to(el, {
        opacity: 0,
        ease: 'power2.in',
        duration: 0.3,
      }, 0.7)
    })

    return () => {
      triggers.forEach(t => t.kill())
    }
  }, [resolvedImages])

  return (
    <div
      ref={sectionRef}
      style={{
        position: 'relative',
        height: '80vh',
        overflow: 'hidden',
        background: '#0a0a0a',
        // Subtle top gradient blending from the hero
        backgroundImage: 'linear-gradient(to bottom, #050505 0%, #0a0a0a 30%)',
      }}
    >
      {resolvedImages.map((src, i) => {
        const layout = CASCADE_LAYOUT[i]
        return (
          <div
            key={i}
            ref={el => { imageRefs.current[i] = el }}
            style={{
              position: 'absolute',
              left: layout.left,
              top: 0,
              width: layout.width,
              aspectRatio: '4/3',
              borderRadius: 14,
              overflow: 'hidden',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.08)',
              willChange: 'transform, opacity',
              pointerEvents: 'none',
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes={`${layout.width}px`}
              style={{ objectFit: 'cover' }}
              unoptimized
            />
            {/* Subtle violet tint overlay */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(120,80,200,0.15), transparent 60%)',
              pointerEvents: 'none',
            }} />
          </div>
        )
      })}

      {/* Fade-to-black at the bottom so it blends into Section 1 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        background: 'linear-gradient(to bottom, transparent, #0a0a0a)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
    </div>
  )
}

// ─── Main Landing Page ───────────────────────────────────────────────────────

export default function LandingPage({ portfolioImages, creators }: LandingPageProps) {
  const [shattered, setShattered] = useState(false)
  const [heroGone, setHeroGone]   = useState(false)

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
        The hero is position:fixed so it stays on screen while content scrolls under it.
        The scroll spacer (250vh) drives the card animation via ScrollTrigger.
        The hero fades out halfway through Section 1 (the ReelSection).
      */}

      {/* Scroll spacer — drives the card animation */}
      <div ref={heroScrollerRef} style={{ height: '250vh' }} />

      {/* Hero — fixed overlay, fades out as Section 1 scrolls in */}
      <div
        id="hero-overlay"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 5,
          pointerEvents: shattered ? 'none' : 'auto',
          // Gradient mask: full opacity top, fades to transparent at bottom
          WebkitMaskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
          maskImage: 'linear-gradient(to bottom, black 40%, transparent 100%)',
        }}
      >
        <HeroStage
          images={resolvedImages}
          onShattered={handleShattered}
          onHeroGone={handleHeroGone}
          scrollerRef={heroScrollerRef}
        />
      </div>

      {/* Creator sections — scroll under the fixed hero */}
      <LandingSections creators={creators} heroGone={heroGone} />
    </div>
  )
}
