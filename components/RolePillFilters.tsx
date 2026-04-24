"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

const PILLS = [
  { label: "Directors", value: "Director" },
  { label: "Cinematographers", value: "Cinematographer" },
  { label: "Motion Artists", value: "Motion Artist" },
  { label: "Editors", value: "Editor" },
  { label: "Photographers", value: "Photographer" },
  { label: "Writers", value: "Writer" },
] as const

export function RolePillFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const activeRole = searchParams.get("roles") ?? null
  const [input, setInput] = useState(searchParams.get("q") ?? "")
  const isFocusedRef = useRef(false)

  useEffect(() => {
    if (!isFocusedRef.current) {
      setInput(searchParams.get("q") ?? "")
    }
  }, [searchParams])

  function handleRoleClick(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === null || value === activeRole) {
      params.delete("roles")
    } else {
      params.set("roles", value)
    }
    const query = params.toString()
    startTransition(() => {
      router.push(pathname + (query ? `?${query}` : ""))
    })
  }

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value.trim()) {
      params.set("q", value.trim())
    } else {
      params.delete("q")
    }
    const query = params.toString()
    startTransition(() => {
      router.push(pathname + (query ? `?${query}` : ""))
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      handleSearch(input)
    }
  }

  return (
    <div className="flex flex-1 flex-wrap items-center gap-2">
      {PILLS.map((pill) => {
        const isActive = activeRole === pill.value
        return (
          <button
            key={pill.label}
            type="button"
            onClick={() => handleRoleClick(pill.value)}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border",
              isActive
                ? "border-[#8B5CF6]/60 bg-[#8B5CF6]/10 text-[#d0bcff] shadow-[0_0_14px_rgba(139,92,246,0.18)]"
                : "border-white/15 text-white/60 hover:border-[#8B5CF6]/40 hover:text-white/90",
            ].join(" ")}
          >
            {pill.label}
          </button>
        )
      })}

      {/* Search input */}
      <div className="relative ml-2">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-white/30" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            isFocusedRef.current = true
          }}
          onBlur={() => {
            isFocusedRef.current = false
            handleSearch(input)
          }}
          placeholder="Search..."
          aria-label="Search creators"
          className="h-8 w-52 rounded-full border border-white/15 bg-white/5 pl-8 pr-3 text-sm text-white/90 placeholder:text-white/30 focus:border-[#8B5CF6]/50 focus:outline-none transition-colors"
        />
        {isPending && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-full">
            <div className="h-full w-full animate-[gradient-slide_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent bg-[length:200%_100%]" />
          </div>
        )}
      </div>
    </div>
  )
}
