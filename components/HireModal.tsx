"use client"

import { useActionState, useEffect } from "react"
import { useFormStatus } from "react-dom"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2Icon } from "lucide-react"
import { requestConnection } from "@/app/actions/connection"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface HireModalProps {
  talentId: string
  talentName: string
  glowing?: boolean
  isAuthenticated: boolean
}

const initialState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" />
          Sending Request...
        </>
      ) : (
        "Send Request"
      )}
    </Button>
  )
}

export function HireModal({ talentId, talentName, glowing = false, isAuthenticated }: HireModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, formAction] = useActionState(requestConnection, initialState)

  function handleTriggerClick(e: React.MouseEvent) {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }

  useEffect(() => {
    if (state.error === null && state !== initialState) {
      toast.success("Connection request sent!", {
        description: `Your request to ${talentName} has been sent. Head to your inbox to follow up.`,
      })
      router.push("/inbox")
    }
  }, [state, talentName, router])

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="lg"
          onClick={handleTriggerClick}
          className={
            glowing
              ? "w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-500 hover:to-indigo-500 border-0"
              : "w-full"
          }
        >
          Request Connection
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request a Connection</DialogTitle>
          <DialogDescription>
            Tell {talentName} about your project. They&apos;ll receive your
            pitch in their inbox.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="talent_id" value={talentId} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="project_title">Project Title</Label>
            <Input
              id="project_title"
              name="project_title"
              placeholder="e.g. Feature film — The Long Road"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="budget_estimate">
              Budget Estimate{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="budget_estimate"
              name="budget_estimate"
              placeholder="e.g. $5,000 – $10,000"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="initial_pitch">Initial Pitch</Label>
            <Textarea
              id="initial_pitch"
              name="initial_pitch"
              placeholder="Briefly describe the project and why you'd like to work with this creator..."
              rows={5}
              required
            />
          </div>

          {state.error && (
            <p className="text-sm font-medium text-destructive">{state.error}</p>
          )}

          <DialogFooter className="mt-2">
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
