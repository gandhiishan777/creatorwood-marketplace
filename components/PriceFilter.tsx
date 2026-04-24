"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ChevronDown } from "lucide-react"

const BUCKETS = [
  { label: "Any", value: null },
  { label: "Under $100", value: "100" },
  { label: "Under $250", value: "250" },
  { label: "Under $500", value: "500" },
  { label: "Under $1k", value: "1000" },
] as const

export function PriceFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeValue = searchParams.get("maxRate")
  const activeBucket = BUCKETS.find((b) => b.value === activeValue) ?? BUCKETS[0]
  const isActive = activeBucket.value !== null

  useEffect(() => {
    if (!open) return
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handleMouseDown)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handleMouseDown)
      document.removeEventListener("keydown", handleKey)
    }
  }, [open])

  function handleSelect(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null) {
      params.delete("maxRate")
    } else {
      params.set("maxRate", value)
    }
    const query = params.toString()
    setOpen(false)
    startTransition(() => {
      router.push(pathname + (query ? `?${query}` : ""))
    })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={[
          "inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border",
          isActive
            ? "border-[#8B5CF6]/60 bg-[#8B5CF6]/10 text-[#d0bcff] shadow-[0_0_14px_rgba(139,92,246,0.18)]"
            : "border-white/15 text-white/60 hover:border-[#8B5CF6]/40 hover:text-white/90",
        ].join(" ")}
      >
        <span>{isActive ? activeBucket.label : "Price"}</span>
        <ChevronDown
          className={["size-3.5 transition-transform duration-200", open ? "rotate-180" : ""].join(" ")}
        />
        {isPending && (
          <span className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-full">
            <span className="block h-full w-full animate-[gradient-slide_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent bg-[length:200%_100%]" />
          </span>
        )}
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-[calc(100%+6px)] z-50 min-w-[180px] rounded-2xl border border-white/10 bg-[#0f0f12]/95 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl"
        >
          <div className="flex flex-col gap-1">
            {BUCKETS.map((bucket) => {
              const selected = bucket.value === (activeBucket.value ?? null)
              return (
                <button
                  key={bucket.label}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => handleSelect(bucket.value)}
                  className={[
                    "w-full text-left px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer border",
                    selected
                      ? "border-[#8B5CF6]/60 bg-[#8B5CF6]/10 text-[#d0bcff] shadow-[0_0_14px_rgba(139,92,246,0.18)]"
                      : "border-transparent text-white/60 hover:border-[#8B5CF6]/40 hover:text-white/90 hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  {bucket.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
