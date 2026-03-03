"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search, Sparkles } from "lucide-react"

export function CastingSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [input, setInput] = useState(searchParams.get("q") ?? "")
  const isFocusedRef = useRef(false)

  // Sync input from URL only when the field is not focused
  // (e.g. when "Clear all filters" resets ?q externally)
  useEffect(() => {
    if (!isFocusedRef.current) {
      setInput(searchParams.get("q") ?? "")
    }
  }, [searchParams])

  function triggerSearch(value: string) {
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

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault()
      triggerSearch(input)
    }
  }

  return (
    <div className="mx-auto mb-8 w-full max-w-2xl">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Find Your Next Collaborator
      </p>

      <div className="relative">
        {/* Search icon — clickable to trigger search */}
        <button
          type="button"
          onClick={() => triggerSearch(input)}
          aria-label="Search"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="size-5" />
        </button>

        <input
          type="text"
          value={input}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { isFocusedRef.current = true }}
          onBlur={() => { isFocusedRef.current = false }}
          placeholder="Describe your project (e.g., 'I need a Sora expert for a 30s dream sequence')..."
          className="h-14 w-full rounded-xl border-2 border-white/15 bg-card/50 pl-12 pr-12 text-sm text-foreground shadow-inner transition-colors placeholder:text-muted-foreground/60 focus:border-brand/50 focus:outline-none"
        />

        {/* Sparkles icon — right side */}
        <Sparkles
          className={`absolute right-4 top-1/2 size-5 -translate-y-1/2 transition-colors ${
            isPending ? "text-brand animate-pulse" : "text-muted-foreground/40"
          }`}
        />

        {/* Animated gradient loading bar */}
        <div
          className={`absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl transition-opacity duration-300 ${
            isPending ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="h-full w-full animate-[gradient-slide_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-brand to-transparent bg-[length:200%_100%]" />
        </div>
      </div>

      {/* Status text */}
      <p
        className={`mt-2 text-xs text-muted-foreground transition-opacity duration-200 ${
          isPending ? "opacity-100" : "opacity-0"
        }`}
      >
        AI is matching...
      </p>
    </div>
  )
}
