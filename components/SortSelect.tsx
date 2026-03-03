"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { ArrowUpDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
] as const

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const current = searchParams.get("sort") ?? "recommended"

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "recommended") {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    const query = params.toString()
    router.push(pathname + (query ? `?${query}` : ""))
  }

  return (
    <Select value={current} onValueChange={handleChange}>
      <SelectTrigger className="h-9 w-auto gap-1.5 text-sm" aria-label="Sort by">
        <ArrowUpDown className="size-3.5 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SORT_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
