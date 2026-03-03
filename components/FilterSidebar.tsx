"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"

const ROLES = ["Director", "Writer", "Producer", "Editor"] as const

export function FilterSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedRoles = searchParams.get("roles")?.split(",").filter(Boolean) ?? []
  const currentMaxRate = searchParams.get("maxRate")

  const [displayRate, setDisplayRate] = useState(
    currentMaxRate ? Number(currentMaxRate) : 500
  )

  function handleRoleChange(role: string, checked: boolean) {
    const next = checked
      ? [...selectedRoles, role]
      : selectedRoles.filter((r) => r !== role)

    const params = new URLSearchParams(searchParams.toString())
    if (next.length > 0) {
      params.set("roles", next.join(","))
    } else {
      params.delete("roles")
    }
    const query = params.toString()
    router.push(pathname + (query ? `?${query}` : ""))
  }

  function handleRateCommit(values: number[]) {
    const rate = values[0]
    const params = new URLSearchParams(searchParams.toString())
    if (rate === 500) {
      params.delete("maxRate")
    } else {
      params.set("maxRate", String(rate))
    }
    const query = params.toString()
    router.push(pathname + (query ? `?${query}` : ""))
  }

  return (
    <aside className="flex flex-col gap-6 rounded-xl border bg-card p-5 text-card-foreground shadow-sm">
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Filters
        </h2>

        <div className="flex flex-col gap-4">
          <p className="text-sm font-medium">Role</p>
          <div className="flex flex-col gap-2.5">
            {ROLES.map((role) => (
              <div key={role} className="flex items-center gap-2.5">
                <Checkbox
                  id={`role-${role}`}
                  checked={selectedRoles.includes(role)}
                  onCheckedChange={(checked) =>
                    handleRoleChange(role, checked === true)
                  }
                />
                <Label
                  htmlFor={`role-${role}`}
                  className="cursor-pointer text-sm font-normal"
                >
                  {role}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Max Hourly Rate</p>
          <span className="text-sm font-semibold text-primary">
            {displayRate === 500 ? "Any" : `$${displayRate}/hr`}
          </span>
        </div>
        <Slider
          min={0}
          max={500}
          step={10}
          value={[displayRate]}
          onValueChange={(vals) => setDisplayRate(vals[0])}
          onValueCommit={handleRateCommit}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>$0</span>
          <span>$500+</span>
        </div>
      </div>
    </aside>
  )
}
