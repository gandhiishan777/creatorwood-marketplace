"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"

export function CastingSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [input, setInput] = useState(searchParams.get("q") ?? "")
  const isFocusedRef = useRef(false)

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
      <div className="relative">
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
          placeholder="Search by name..."
          aria-label="Search creators"
          className="h-12 w-full rounded-xl border bg-card pl-12 pr-4 text-sm text-foreground shadow-sm transition-[color,box-shadow] placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        />

        {isPending && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden rounded-b-xl">
            <div className="h-full w-full animate-[gradient-slide_1.5s_linear_infinite] bg-gradient-to-r from-transparent via-primary to-transparent bg-[length:200%_100%]" />
          </div>
        )}
      </div>
    </div>
  )
}
