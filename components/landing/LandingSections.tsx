'use client'

import { useEffect, useRef, useState } from 'react'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  id: string
  display_name: string
  avatar_url: string | null
  roles: string[] | null
  hourly_rate: number | null
  thumbnail_url: string | null
  online?: boolean
}

interface LandingSectionsProps {
  creators: Creator[]
  heroGone?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PORTFOLIO_IMGS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=700&q=75',
  'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=700&q=75',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=700&q=75',
  'https://images.unsplash.com/photo-1481487196290-c152efe083f5?w=700&q=75',
  'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=700&q=75',
  'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=700&q=75',
]

const FALLBACK_CREATORS: Creator[] = [
  { id: '1', display_name: 'Maya Okafor', avatar_url: null, roles: ['Generative filmmaker'], hourly_rate: 180, online: true, thumbnail_url: PORTFOLIO_IMGS[0] },
  { id: '2', display_name: 'Kenji Vale', avatar_url: null, roles: ['Music producer · Suno'], hourly_rate: 140, online: true, thumbnail_url: PORTFOLIO_IMGS[1] },
  { id: '3', display_name: 'Sara Lindqvist', avatar_url: null, roles: ['AI photographer'], hourly_rate: 220, online: false, thumbnail_url: PORTFOLIO_IMGS[2] },
  { id: '4', display_name: 'Orin Fox', avatar_url: null, roles: ['Motion · Runway'], hourly_rate: 160, online: true, thumbnail_url: PORTFOLIO_IMGS[3] },
  { id: '5', display_name: 'Amara Juno', avatar_url: null, roles: ['Product viz · Midjourney'], hourly_rate: 200, online: false, thumbnail_url: PORTFOLIO_IMGS[4] },
  { id: '6', display_name: 'Theo Larsen', avatar_url: null, roles: ['Narrative · Luma'], hourly_rate: 175, online: true, thumbnail_url: PORTFOLIO_IMGS[5] },
  { id: '7', display_name: 'Rin Matsuda', avatar_url: null, roles: ['Editorial · ComfyUI'], hourly_rate: 210, online: true, thumbnail_url: PORTFOLIO_IMGS[0] },
  { id: '8', display_name: 'Luca Dominguez', avatar_url: null, roles: ['Concept art'], hourly_rate: 150, online: false, thumbnail_url: PORTFOLIO_IMGS[1] },
]

const REVIEWS = [
  { id: 'r1', author: 'Priya M.', role: 'Creative Director, Verve', text: 'Kenji delivered a full album of stems in 72 hours. The quality was unreal — every track sounded like it had a year of production behind it.', rating: 5 },
  { id: 'r2', author: 'James T.', role: 'Founder, Horizon Labs', text: 'Maya turned our brief into a 60-second film that stopped people mid-scroll. I have never seen a team work that fast or that well.', rating: 5 },
  { id: 'r3', author: 'Sofia R.', role: 'Head of Brand, Dune Co.', text: 'Sara\'s editorial shoot gave us six months of content in one day. The aesthetic was exactly right — no revisions needed.', rating: 5 },
  { id: 'r4', author: 'Marcus L.', role: 'CEO, Drift Studio', text: 'Working with Orin felt like having a world-class motion team on retainer. The turnaround was insane and the craft was impeccable.', rating: 5 },
  { id: 'r5', author: 'Yuki S.', role: 'Product Lead, Forma', text: 'Amara rendered our entire product line in photorealistic 3D. The assets were usable in our campaign the same day. Remarkable.', rating: 5 },
  { id: 'r6', author: 'Elena V.', role: 'CMO, Brightfield', text: 'Theo scripted, shot, and edited our brand film in a weekend. The final cut was better than anything our agency had produced in years.', rating: 5 },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= rating ? '#f59e0b' : 'none'} stroke={i <= rating ? '#f59e0b' : '#8a8a90'} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}

// ─── Talent Card ──────────────────────────────────────────────────────────────

function TalentCard({ creator }: { creator: Creator }) {
  const cardRef = useRef<HTMLDivElement>(null)

  function handleMouseEnter() {
    if (!cardRef.current) return
    gsap.to(cardRef.current, { y: -6, borderColor: 'rgba(255,255,255,0.18)', duration: 0.25, ease: 'power2.out' })
  }

  function handleMouseLeave() {
    if (!cardRef.current) return
    gsap.to(cardRef.current, { y: 0, borderColor: 'rgba(255,255,255,0.08)', duration: 0.3, ease: 'power2.out' })
  }

  const initials = getInitials(creator.display_name)
  const role = creator.roles?.[0] ?? 'Creator'

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        width: 320,
        borderRadius: 16,
        overflow: 'hidden',
        background: '#15151a',
        border: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
        cursor: 'pointer',
        transition: 'box-shadow 0.25s',
      }}
    >
      {/* Thumbnail */}
      <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
        {creator.thumbnail_url ? (
          <Image
            src={creator.thumbnail_url}
            alt={`${creator.display_name}'s work`}
            fill
            sizes="320px"
            style={{ objectFit: 'cover' }}
            unoptimized
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            background: 'linear-gradient(135deg, oklch(0.25 0.15 275), oklch(0.15 0.08 275))',
          }} />
        )}
        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)',
        }} />
        {/* Online indicator */}
        {creator.online && (
          <div style={{
            position: 'absolute', top: 12, right: 12,
            width: 8, height: 8, borderRadius: '50%',
            background: '#22c55e',
            boxShadow: '0 0 0 2px rgba(34,197,94,0.3)',
          }} />
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 18px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, oklch(0.45 0.18 275), oklch(0.3 0.12 275))',
          fontSize: 13, fontFamily: 'var(--font-geist-mono), monospace',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
        }}>
          {creator.avatar_url ? (
            <Image src={creator.avatar_url} alt={creator.display_name} width={40} height={40} style={{ objectFit: 'cover' }} unoptimized />
          ) : (
            initials
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <p style={{
              color: '#f6f6f7', fontSize: 14, fontWeight: 500,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {creator.display_name}
            </p>
            {creator.hourly_rate != null && (
              <span style={{ color: '#8a8a90', fontSize: 12, flexShrink: 0, fontFamily: 'var(--font-geist-mono), monospace' }}>
                ${creator.hourly_rate}/hr
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
            <p style={{ color: '#8a8a90', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {role}
            </p>
            <StarRating rating={5} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 01: Creator Reel ─────────────────────────────────────────────────

function ReelSection({ creators }: { creators: Creator[] }) {
  const row1Ref = useRef<HTMLDivElement>(null)
  const row2Ref = useRef<HTMLDivElement>(null)
  const anim1Ref = useRef<gsap.core.Tween | null>(null)
  const anim2Ref = useRef<gsap.core.Tween | null>(null)

  const source = creators.length > 0 ? creators : FALLBACK_CREATORS
  // Double the array to create seamless loop effect
  const doubled = [...source, ...source]

  useEffect(() => {
    if (!row1Ref.current || !row2Ref.current) return

    // Row 1: scrolls left (0 → -50%)
    anim1Ref.current = gsap.to(row1Ref.current, {
      xPercent: -50,
      duration: 55,
      ease: 'none',
      repeat: -1,
    })

    // Row 2: starts at -50% and scrolls back to 0 (right direction)
    gsap.set(row2Ref.current, { xPercent: -50 })
    anim2Ref.current = gsap.to(row2Ref.current, {
      xPercent: 0,
      duration: 70,
      ease: 'none',
      repeat: -1,
    })

    return () => {
      anim1Ref.current?.kill()
      anim2Ref.current?.kill()
    }
  }, [])

  return (
    <section
      id="reel"
      style={{
        position: 'relative',
        paddingTop: 40,
        paddingBottom: 140,
        background: '#0a0a0a',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 28px' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'oklch(0.68 0.19 275)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ width: 22, height: 1, background: 'oklch(0.68 0.19 275)', display: 'block' }} />
            01 · The Creators
          </span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.6vw, 84px)',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: '#fff',
          marginBottom: 60,
        }}>
          Directors, producers,{' '}
          <em style={{ color: '#eadfff', fontStyle: 'italic' }}>image-makers.</em>
        </h2>
      </div>

      {/* Row 1: left-scrolling */}
      <div style={{ overflow: 'hidden', paddingBottom: 22 }}>
        <div ref={row1Ref} style={{ display: 'flex', gap: 22, width: 'max-content' }}>
          {doubled.map((c, i) => (
            <TalentCard key={`r1-${c.id}-${i}`} creator={c} />
          ))}
        </div>
      </div>

      {/* Row 2: right-scrolling */}
      <div style={{ overflow: 'hidden', paddingTop: 22 }}>
        <div ref={row2Ref} style={{ display: 'flex', gap: 22, width: 'max-content' }}>
          {doubled.map((c, i) => (
            <TalentCard key={`r2-${c.id}-${i}`} creator={c} />
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 02 Mockups ───────────────────────────────────────────────────────

function DiscoverMockup() {
  return (
    <div style={{
      borderRadius: 14,
      overflow: 'hidden',
      background: '#15151a',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: 16,
    }}>
      <div style={{ borderRadius: 10, overflow: 'hidden', position: 'relative', aspectRatio: '16/9' }}>
        <Image
          src={PORTFOLIO_IMGS[0]}
          alt="Portfolio thumbnail"
          fill
          sizes="400px"
          style={{ objectFit: 'cover' }}
          unoptimized
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)' }} />
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12 }}>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Maya Okafor</p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Generative filmmaker · $180/hr</p>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        {['Motion', 'AI Film', 'Runway'].map(tag => (
          <span key={tag} style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11,
            background: 'rgba(255,255,255,0.05)', color: '#8a8a90',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>{tag}</span>
        ))}
      </div>
    </div>
  )
}

function PitchMockup({ brief, setBrief, budget, setBudget, sent, setSent }: {
  brief: string
  setBrief: (v: string) => void
  budget: string
  setBudget: (v: string) => void
  sent: boolean
  setSent: (v: boolean) => void
}) {

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    padding: '10px 12px',
    fontSize: 12,
    color: '#f6f6f7',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'none' as const,
    lineHeight: 1.5,
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.15s',
  }

  return (
    <div style={{
      borderRadius: 14,
      background: '#15151a',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: 20,
    }}>
      <p style={{ color: '#f6f6f7', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Send a connection request</p>
      <p style={{ color: '#8a8a90', fontSize: 11, marginBottom: 16 }}>to Maya Okafor</p>

      {sent ? (
        <div style={{
          textAlign: 'center', padding: '24px 0',
          color: 'oklch(0.68 0.19 275)', fontSize: 13, fontWeight: 500,
        }}>
          ✓ Request sent — Maya will be in touch soon.
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 10 }}>
            <label style={{ color: '#8a8a90', fontSize: 11, display: 'block', marginBottom: 4 }}>Project brief</label>
            <textarea
              rows={2}
              value={brief}
              onChange={e => setBrief(e.target.value)}
              placeholder="We need a 60s brand film for our product launch..."
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.68 0.19 275 / 0.6)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ color: '#8a8a90', fontSize: 11, display: 'block', marginBottom: 4 }}>Budget range</label>
            <input
              type="text"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              placeholder="$2,000 – $4,000"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = 'oklch(0.68 0.19 275 / 0.6)' }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            />
          </div>
          <button
            onClick={() => setSent(true)}
            style={{
              width: '100%', padding: '10px 0', borderRadius: 999,
              background: 'oklch(0.68 0.19 275)', color: '#0a0a0a',
              border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          >
            Send Request →
          </button>
        </>
      )}
    </div>
  )
}

function ChatMockup({ brief, budget, sent }: { brief: string; budget: string; sent: boolean }) {
  // Show the user's brief and budget as the first messages when the pitch has been sent
  const hasPitch = sent && (brief.trim() || budget.trim())

  return (
    <div style={{
      borderRadius: 14,
      background: '#15151a',
      border: '1px solid rgba(255,255,255,0.08)',
      padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.45 0.18 275), oklch(0.3 0.12 275))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, color: '#fff', fontFamily: 'var(--font-geist-mono), monospace',
        }}>MO</div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#f6f6f7' }}>Maya Okafor</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
            <span style={{ fontSize: 10, color: '#22c55e' }}>Online now</span>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {hasPitch ? (
          <>
            {/* User's brief as a sent message */}
            {brief.trim() && (
              <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div style={{
                  padding: '8px 12px', borderRadius: '12px 12px 4px 12px',
                  background: 'oklch(0.68 0.19 275)', color: '#0a0a0a', fontSize: 12,
                }}>
                  {brief.trim()}
                </div>
              </div>
            )}
            {/* Budget as a follow-up */}
            {budget.trim() && (
              <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
                <div style={{
                  padding: '8px 12px', borderRadius: '12px 12px 4px 12px',
                  background: 'oklch(0.68 0.19 275)', color: '#0a0a0a', fontSize: 12,
                }}>
                  Budget: {budget.trim()}
                </div>
              </div>
            )}
            {/* Maya's response */}
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
              <div style={{
                padding: '8px 12px', borderRadius: '12px 12px 12px 4px',
                background: 'rgba(255,255,255,0.06)', color: '#f6f6f7', fontSize: 12,
              }}>
                Love this brief! Let me put together a mood board. Free for a call tomorrow?
              </div>
            </div>
            {/* Typing indicator */}
            <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
              <span style={{ color: '#8a8a90', fontSize: 11 }}>You are typing</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 4, height: 4, borderRadius: '50%', background: '#8a8a90',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    display: 'block',
                  }} />
                ))}
              </span>
            </div>
          </>
        ) : (
          <>
            {/* Default static messages */}
            <div style={{ alignSelf: 'flex-end', maxWidth: '80%' }}>
              <div style={{
                padding: '8px 12px', borderRadius: '12px 12px 4px 12px',
                background: 'oklch(0.68 0.19 275)', color: '#0a0a0a', fontSize: 12,
              }}>
                Just reviewed the brief — love the direction.
              </div>
            </div>
            <div style={{ alignSelf: 'flex-start', maxWidth: '80%' }}>
              <div style={{
                padding: '8px 12px', borderRadius: '12px 12px 12px 4px',
                background: 'rgba(255,255,255,0.06)', color: '#f6f6f7', fontSize: 12,
              }}>
                Let&apos;s get on a call tomorrow at 10am?
              </div>
            </div>
            {/* Typing indicator */}
            <div style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: 4, padding: '0 4px' }}>
              <span style={{ color: '#8a8a90', fontSize: 11 }}>You are typing</span>
              <span style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 4, height: 4, borderRadius: '50%', background: '#8a8a90',
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                    display: 'block',
                  }} />
                ))}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Section 02: How It Works ─────────────────────────────────────────────────

function HowItWorksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stepsRef = useRef<(HTMLDivElement | null)[]>([])
  const pathRef  = useRef<SVGPathElement>(null)
  const path2Ref = useRef<SVGPathElement>(null)
  const path3Ref = useRef<SVGPathElement>(null)
  const svgRef   = useRef<SVGSVGElement>(null)
  const glowPath1Ref = useRef<SVGPathElement>(null)
  const glowPath2Ref = useRef<SVGPathElement>(null)
  const glowPath3Ref = useRef<SVGPathElement>(null)

  // Shared state between PitchMockup and ChatMockup
  const [brief, setBrief] = useState('')
  const [budget, setBudget] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Animate each step card
    stepsRef.current.forEach((step, i) => {
      if (!step) return
      gsap.fromTo(
        step,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: i * 0.12,
          scrollTrigger: {
            trigger: step,
            start: 'top 85%',
            once: true,
          },
        }
      )
    })

    // Draw-on animation for all paths — scrubbed to the FULL section scroll
    const allPaths = [
      pathRef.current, path2Ref.current, path3Ref.current,
      glowPath1Ref.current, glowPath2Ref.current, glowPath3Ref.current,
    ]
    allPaths.forEach((p) => {
      if (!p) return
      const length = p.getTotalLength()
      gsap.set(p, { strokeDasharray: length, strokeDashoffset: length })
    })

    // Main paths draw on scrubbed to section scroll
    const mainPaths = [pathRef.current, path2Ref.current, path3Ref.current]
    const glowPaths = [glowPath1Ref.current, glowPath2Ref.current, glowPath3Ref.current]

    // All lines draw from left to right as you scroll through the section
    mainPaths.forEach((p, i) => {
      if (!p) return
      const length = p.getTotalLength()
      gsap.to(p, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          end: 'center 60%',
          scrub: true,
        },
      })
    })

    // Glow paths draw slightly behind the main paths
    glowPaths.forEach((p) => {
      if (!p) return
      gsap.to(p, {
        strokeDashoffset: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
          end: 'center 55%',
          scrub: true,
        },
      })
    })

    // Step nodes pop in as the line reaches them
    if (svgRef.current) {
      const nodes = svgRef.current.querySelectorAll('.step-node')
      nodes.forEach((node, i) => {
        gsap.fromTo(node,
          { scale: 0, transformOrigin: 'center center', opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: 'back.out(3)',
            scrollTrigger: {
              trigger: sectionRef.current,
              // Each node appears at roughly 1/3 intervals through the section
              start: `${20 + i * 25}% center`,
              once: true,
            },
          }
        )
      })

      // Traveling particles start after lines are partially drawn
      const particles = svgRef.current.querySelectorAll('.travel-dot')
      particles.forEach((dot, i) => {
        const p = mainPaths[i % mainPaths.length]
        if (!p) return
        const length = p.getTotalLength()

        function animateParticle() {
          const proxy = { t: 0 }
          gsap.to(proxy, {
            t: 1,
            duration: 3 + i * 1.2,
            ease: 'none',
            repeat: -1,
            delay: i * 0.8,
            onUpdate: () => {
              const pt = p!.getPointAtLength(proxy.t * length)
              gsap.set(dot, { attr: { cx: pt.x, cy: pt.y } })
            },
          })
        }

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: '40% center',
          once: true,
          onEnter: animateParticle,
        })
      })
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => {
        if (t.vars.trigger && (
          stepsRef.current.some(s => s === t.vars.trigger) ||
          t.vars.trigger === sectionRef.current
        )) {
          t.kill()
        }
      })
    }
  }, [])

  const steps = [
    {
      num: '01',
      title: 'Discover talent',
      desc: 'Browse a curated roster of AI-native creators — filmmakers, musicians, photographers, and visual artists. Filter by craft, tool, or rate.',
      mockup: <DiscoverMockup />,
    },
    {
      num: '02',
      title: 'Send a pitch',
      desc: 'Drop a connection request with your brief and budget. No agencies, no retainers — just a direct line to the person who will do the work.',
      mockup: <PitchMockup brief={brief} setBrief={setBrief} budget={budget} setBudget={setBudget} sent={sent} setSent={setSent} />,
    },
    {
      num: '03',
      title: 'Work together, live',
      desc: 'Collaborate in real time through our built-in workspace. Share files, give feedback, and ship faster than any traditional production pipeline.',
      mockup: <ChatMockup brief={brief} budget={budget} sent={sent} />,
    },
  ]

  return (
    <section
      id="how"
      ref={sectionRef}
      style={{
        position: 'relative',
        padding: '140px 28px',
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>

      <div style={{ maxWidth: 1320, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'oklch(0.68 0.19 275)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ width: 22, height: 1, background: 'oklch(0.68 0.19 275)', display: 'block' }} />
            02 · How it works
          </span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.6vw, 84px)',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: '#fff',
          marginBottom: 0,
        }}>
          Three steps,{' '}
          <em style={{ color: '#eadfff', fontStyle: 'italic' }}>no middlemen.</em>
        </h2>

        {/*
          SVG connector overlay — spans the full section.
          Three intertwining lines draw left-to-right as you scroll.
          Line 3 rises from below the card area.
        */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0,
          overflow: 'hidden',
        }}>
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            aria-hidden
          >
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#7c5cbf" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="100%" stopColor="#7c5cbf" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#c084fc" stopOpacity="0.5" />
                <stop offset="50%" stopColor="#e9d5ff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#c084fc" stopOpacity="0.5" />
              </linearGradient>
              <filter id="glow1" x="-5%" y="-50%" width="110%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" />
              </filter>
              <filter id="glow2" x="-5%" y="-50%" width="110%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" />
              </filter>
              <radialGradient id="nodeGlow">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#7c5cbf" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#7c5cbf" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/*
              Line 1 — primary violet, spans full width left to right.
              Weaves up and down through the section.
              x: 0 = left edge, 100 = right edge
              y: ~20 = heading area, ~60 = card area
            */}
            <path
              ref={glowPath1Ref}
              d="M0 22 C8 28, 12 18, 17 24 C25 32, 30 20, 38 28 C45 35, 48 22, 55 30 C62 38, 68 24, 75 32 C82 26, 88 35, 95 28 L100 30"
              fill="none" stroke="#7c5cbf" strokeWidth="0.8" opacity="0.15" filter="url(#glow1)"
            />
            <path
              ref={pathRef}
              d="M0 22 C8 28, 12 18, 17 24 C25 32, 30 20, 38 28 C45 35, 48 22, 55 30 C62 38, 68 24, 75 32 C82 26, 88 35, 95 28 L100 30"
              fill="none" stroke="url(#grad1)" strokeWidth="0.22" strokeLinecap="round"
            />

            {/*
              Line 2 — indigo, weaves opposite to line 1.
            */}
            <path
              ref={glowPath2Ref}
              d="M0 30 C7 22, 14 35, 20 28 C28 20, 34 34, 42 26 C48 20, 54 36, 60 28 C68 20, 74 34, 80 26 C86 20, 92 32, 100 24"
              fill="none" stroke="#6366f1" strokeWidth="0.6" opacity="0.12" filter="url(#glow1)"
            />
            <path
              ref={path2Ref}
              d="M0 30 C7 22, 14 35, 20 28 C28 20, 34 34, 42 26 C48 20, 54 36, 60 28 C68 20, 74 34, 80 26 C86 20, 92 32, 100 24"
              fill="none" stroke="url(#grad2)" strokeWidth="0.14" strokeLinecap="round"
            />

            {/*
              Line 3 — rises from below the cards, starts at bottom-left and curves up to the right.
            */}
            <path
              ref={glowPath3Ref}
              d="M10 95 C15 80, 18 70, 25 60 C32 50, 38 58, 45 48 C52 40, 58 52, 65 42 C72 34, 78 44, 85 36 C90 30, 95 38, 100 32"
              fill="none" stroke="#c084fc" strokeWidth="0.5" opacity="0.1" filter="url(#glow2)"
            />
            <path
              ref={path3Ref}
              d="M10 95 C15 80, 18 70, 25 60 C32 50, 38 58, 45 48 C52 40, 58 52, 65 42 C72 34, 78 44, 85 36 C90 30, 95 38, 100 32"
              fill="none" stroke="url(#grad3)" strokeWidth="0.12" strokeLinecap="round" strokeDasharray="0.8 0.5"
            />

            {/* Step nodes — glowing orbs at each column (x ≈ 17, 50, 83 for 3 columns) */}
            {[
              { cx: 17, cy: 24 },
              { cx: 50, cy: 30 },
              { cx: 83, cy: 32 },
            ].map((n, i) => (
              <g key={i} className="step-node">
                <circle cx={n.cx} cy={n.cy} r="2.2" fill="url(#nodeGlow)" />
                <circle cx={n.cx} cy={n.cy} r="1" fill="none" stroke="#a78bfa" strokeWidth="0.08" opacity="0.5" />
                <circle cx={n.cx} cy={n.cy} r="0.6" fill="#7c5cbf" opacity="0.35" />
                <circle cx={n.cx} cy={n.cy} r="0.3" fill="#a78bfa" />
                <circle cx={n.cx} cy={n.cy} r="0.12" fill="#e9d5ff" />
              </g>
            ))}

            {/* Traveling particles */}
            <circle className="travel-dot" r="0.35" fill="#a78bfa" opacity="0.9">
              <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle className="travel-dot" r="0.25" fill="#818cf8" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle className="travel-dot" r="0.3" fill="#e9d5ff" opacity="0.6">
              <animate attributeName="opacity" values="0.6;0.15;0.6" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </svg>
        </div>

        {/* Steps grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 40,
          marginTop: 80,
          position: 'relative',
          zIndex: 1,
        }}>
          {steps.map((step, i) => (
            <div
              key={step.num}
              ref={el => { stepsRef.current[i] = el }}
              style={{ opacity: 0 }}
            >
              <span style={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontSize: 11,
                color: 'oklch(0.68 0.19 275)',
                letterSpacing: '0.12em',
              }}>
                {step.num}
              </span>
              <h3 style={{
                fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
                fontSize: 36,
                margin: '10px 0 12px',
                fontWeight: 400,
                color: '#fff',
                lineHeight: 1.15,
              }}>
                {step.title}
              </h3>
              <p style={{ color: '#8a8a90', fontSize: 15, lineHeight: 1.55, marginBottom: 24 }}>
                {step.desc}
              </p>
              {step.mockup}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 03: Social Proof ─────────────────────────────────────────────────

function ReviewsSection() {
  const tickerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<gsap.core.Tween | null>(null)

  useEffect(() => {
    if (!tickerRef.current) return

    animRef.current = gsap.to(tickerRef.current, {
      xPercent: -50,
      duration: 80,
      ease: 'none',
      repeat: -1,
    })

    return () => { animRef.current?.kill() }
  }, [])

  const pullQuotes = [
    {
      quote: '"Working with a Creatorwood filmmaker felt like having a Hollywood-grade production team on speed dial. The brief-to-delivery window was 48 hours. The quality was undeniable."',
      author: 'James T.', role: 'Founder, Horizon Labs',
    },
    {
      quote: '"I hired Sara for a single editorial shoot and walked away with six months of campaign content. No art director, no stylist, no second-guessing. Just extraordinary images."',
      author: 'Sofia R.', role: 'Head of Brand, Dune Co.',
    },
  ]

  // Double for seamless loop
  const doubledReviews = [...REVIEWS, ...REVIEWS]

  return (
    <section
      id="reviews"
      style={{
        position: 'relative',
        padding: '140px 28px',
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{ marginBottom: 16 }}>
          <span style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'oklch(0.68 0.19 275)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ width: 22, height: 1, background: 'oklch(0.68 0.19 275)', display: 'block' }} />
            03 · Receipts
          </span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.6vw, 84px)',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: '#fff',
          marginBottom: 80,
        }}>
          What the work{' '}
          <em style={{ color: '#eadfff', fontStyle: 'italic' }}>sounds like.</em>
        </h2>

        {/* Pull quotes grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 40,
          marginBottom: 80,
        }}>
          {pullQuotes.map((q, i) => (
            <div
              key={i}
              style={{
                padding: '40px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <p style={{
                fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
                fontSize: 'clamp(18px, 2vw, 26px)',
                lineHeight: 1.45,
                color: '#f6f6f7',
                fontWeight: 400,
                marginBottom: 28,
              }}>
                {q.quote}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, oklch(0.45 0.18 275), oklch(0.3 0.12 275))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: '#fff', fontFamily: 'var(--font-geist-mono), monospace',
                }}>
                  {q.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p style={{ color: '#f6f6f7', fontSize: 13, fontWeight: 600 }}>{q.author}</p>
                  <p style={{ color: '#8a8a90', fontSize: 11 }}>{q.role}</p>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <StarRating rating={5} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling ticker */}
      <div style={{ overflow: 'hidden', padding: '8px 0' }}>
        <div ref={tickerRef} style={{ display: 'flex', gap: 20, width: 'max-content' }}>
          {doubledReviews.map((r, i) => (
            <div
              key={`${r.id}-${i}`}
              style={{
                width: 320,
                flexShrink: 0,
                padding: '20px 22px',
                borderRadius: 14,
                background: '#15151a',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div style={{ marginBottom: 10 }}>
                <StarRating rating={r.rating} />
              </div>
              <p style={{
                color: 'rgba(246,246,247,0.75)',
                fontSize: 13,
                lineHeight: 1.55,
                marginBottom: 16,
              }}>
                {r.text}
              </p>
              <div>
                <p style={{ color: '#f6f6f7', fontSize: 12, fontWeight: 600 }}>{r.author}</p>
                <p style={{ color: '#8a8a90', fontSize: 11 }}>{r.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Section 04: CTA with particle canvas ────────────────────────────────────

function CTASection() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.offsetWidth
    let height = canvas.offsetHeight
    canvas.width = width
    canvas.height = height

    // Violet particle color components (oklch 0.68 0.19 275 ≈ #7c5cbf)
    const PARTICLE_COLOR = '140, 100, 230'

    type Particle = {
      x: number
      y: number
      r: number
      vx: number
      vy: number
      alpha: number
      alphaDir: number
    }

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.4 + 0.15),
      alpha: Math.random(),
      alphaDir: Math.random() > 0.5 ? 1 : -1,
    }))

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.alpha += p.alphaDir * 0.005

        if (p.alpha >= 0.7) p.alphaDir = -1
        if (p.alpha <= 0) p.alphaDir = 1

        // Wrap vertically
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
        }
        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${PARTICLE_COLOR}, ${p.alpha})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    function onResize() {
      if (!canvas) return
      width = canvas.offsetWidth
      height = canvas.offsetHeight
      canvas.width = width
      canvas.height = height
    }

    window.addEventListener('resize', onResize)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <section
      id="cta"
      style={{
        padding: '180px 28px',
        textAlign: 'center',
        overflow: 'hidden',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        position: 'relative',
        background: '#0a0a0a',
      }}
    >
      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        id="cta-particles"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      />

      {/* Radial glow behind heading */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, oklch(0.68 0.19 275 / 0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1320, margin: '0 auto' }}>
        <h2 style={{
          fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
          fontWeight: 400,
          fontSize: 'clamp(40px, 5.6vw, 84px)',
          lineHeight: 1.0,
          letterSpacing: '-0.02em',
          color: '#fff',
          marginBottom: 48,
        }}>
          The creative future{' '}
          <em style={{ color: '#eadfff', fontStyle: 'italic' }}>is already here.</em>
        </h2>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/discover"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              background: 'oklch(0.68 0.19 275)',
              color: '#0a0a0a',
              boxShadow: '0 10px 40px -10px oklch(0.68 0.19 275 / 0.45)',
              border: 'none',
              textDecoration: 'none',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(-2px)'
              el.style.boxShadow = '0 14px 50px -10px oklch(0.68 0.19 275 / 0.6)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.transform = 'translateY(0)'
              el.style.boxShadow = '0 10px 40px -10px oklch(0.68 0.19 275 / 0.45)'
            }}
          >
            Find a Creator →
          </Link>
          <Link
            href="/join"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 22px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              background: 'rgba(255,255,255,0.04)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.22)',
              backdropFilter: 'blur(8px)',
              textDecoration: 'none',
              transition: 'background 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(255,255,255,0.08)'
              el.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLAnchorElement
              el.style.background = 'rgba(255,255,255,0.04)'
              el.style.transform = 'translateY(0)'
            }}
          >
            Join as a Creator →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const cols = [
    {
      heading: null,
      brand: true,
      links: [],
    },
    {
      heading: 'Product',
      brand: false,
      links: [
        { label: 'Discover', href: '/discover' },
        { label: 'How it works', href: '/#how' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'AI Concierge', href: '/concierge' },
      ],
    },
    {
      heading: 'Company',
      brand: false,
      links: [
        { label: 'About', href: '/about' },
        { label: 'Blog', href: '/blog' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
      ],
    },
    {
      heading: 'Legal',
      brand: false,
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Cookie Policy', href: '/cookies' },
      ],
    },
  ]

  return (
    <footer style={{
      background: '#0a0a0a',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      padding: '64px 28px 32px',
    }}>
      <div style={{ maxWidth: 1320, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
          gap: 40,
          marginBottom: 64,
        }}>
          {cols.map((col, i) => (
            <div key={i}>
              {col.brand ? (
                <>
                  <Link href="/" style={{ textDecoration: 'none' }}>
                    <span style={{
                      fontFamily: 'var(--font-display), "Instrument Serif", Georgia, serif',
                      fontSize: 22,
                      color: '#f6f6f7',
                      display: 'block',
                      marginBottom: 12,
                    }}>
                      Creatorwood
                    </span>
                  </Link>
                  <p style={{ color: '#8a8a90', fontSize: 13, lineHeight: 1.6, maxWidth: 220 }}>
                    The marketplace for AI-native creative talent. Directors, producers, image-makers — on demand.
                  </p>
                </>
              ) : (
                <>
                  <p style={{
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: '#8a8a90',
                    marginBottom: 16,
                  }}>
                    {col.heading}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {col.links.map(link => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          style={{
                            color: 'rgba(246,246,247,0.55)',
                            fontSize: 13,
                            textDecoration: 'none',
                            transition: 'color 0.15s',
                          }}
                          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f6f6f7' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(246,246,247,0.55)' }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <p style={{ color: '#8a8a90', fontSize: 12 }}>
            © {new Date().getFullYear()} Creatorwood, Inc. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Twitter', 'Instagram', 'LinkedIn'].map(name => (
              <a
                key={name}
                href={`https://${name.toLowerCase()}.com/creatorwood`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#8a8a90', fontSize: 12, textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#f6f6f7' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8a8a90' }}
              >
                {name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Root Export ──────────────────────────────────────────────────────────────

export default function LandingSections({ creators, heroGone }: LandingSectionsProps) {
  useEffect(() => {
    if (heroGone) {
      ScrollTrigger.refresh()
    }
  }, [heroGone])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Initialize Lenis for smooth scroll
    let lenis: InstanceType<typeof import('lenis').default> | null = null

    async function initLenis() {
      const { default: Lenis } = await import('lenis')
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      })

      function raf(time: number) {
        lenis?.raf(time)
        ScrollTrigger.update()
        requestAnimationFrame(raf)
      }
      requestAnimationFrame(raf)
    }

    initLenis()

    return () => {
      lenis?.destroy()
    }
  }, [])

  return (
    <div style={{ position: 'relative', background: '#0a0a0a' }}>
      <ReelSection creators={creators} />
      <HowItWorksSection />
      <ReviewsSection />
      <CTASection />
      <Footer />
    </div>
  )
}
