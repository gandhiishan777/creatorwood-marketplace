"use client"

import { useActionState, useEffect, useState } from "react"
import { useFormStatus } from "react-dom"
import { usePathname, useRouter } from "next/navigation"
import { CheckCircle2Icon, Loader2Icon } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { requestConnection } from "@/app/actions/connection"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface HireModalProps {
  talentId: string
  talentName: string
  glowing?: boolean
  isAuthenticated: boolean
}

const PROJECT_TYPES = ["Short Film", "Music Video", "Commercial", "Other"] as const
type ProjectType = (typeof PROJECT_TYPES)[number]

const initialState = { error: null }

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-[11px] uppercase tracking-[0.1em] px-8 py-3 rounded-lg shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {pending ? (
        <>
          <Loader2Icon className="w-4 h-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          Send Request <span aria-hidden>→</span>
        </>
      )}
    </button>
  )
}

export function HireModal({ talentId, talentName, glowing = false, isAuthenticated }: HireModalProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [selectedType, setSelectedType] = useState<ProjectType>("Short Film")
  const [formKey, setFormKey] = useState(0)
  const [state, formAction] = useActionState(requestConnection, initialState)

  function handleTriggerClick(e: React.MouseEvent) {
    if (!isAuthenticated) {
      e.preventDefault()
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      setConfirmed(false)
      setSelectedType("Short Film")
      setFormKey((k) => k + 1)
    }
  }

  function handleDone() {
    setOpen(false)
    setConfirmed(false)
    setSelectedType("Short Film")
    setFormKey((k) => k + 1)
    router.push("/inbox")
  }

  useEffect(() => {
    if (state.error === null && state !== initialState) {
      setConfirmed(true)
    }
  }, [state])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={handleTriggerClick}
          className={
            glowing
              ? "w-full bg-gradient-to-r from-[#a855f7] to-[#6366f1] text-white hover:brightness-110 active:scale-95 transition-all text-sm font-medium py-3 px-6 rounded-xl cursor-pointer"
              : "w-full bg-[#201f22] hover:bg-[#2a2830] border border-white/10 hover:border-white/20 text-[#e5e1e4] text-sm font-medium py-3 px-6 rounded-xl transition-all cursor-pointer"
          }
        >
          Request Connection
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[540px] bg-[#131315]/80 backdrop-blur-3xl border border-white/5 border-t-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] p-0 gap-0 overflow-hidden rounded-xl">
        <VisuallyHidden>
          <DialogTitle>Connect with {talentName}</DialogTitle>
        </VisuallyHidden>
        <AnimatePresence mode="wait">
          {!confirmed ? (
            <motion.div
              key="form"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5">
                <h2 className="font-display text-[32px] leading-[1.3] text-[#e5e1e4] font-normal">
                  Connect with {talentName}
                </h2>
                <p className="text-[16px] text-[#cbc3d7] mt-1">
                  Introduce yourself and propose a collaboration.
                </p>
              </div>

              {/* Body */}
              <form key={formKey} action={formAction}>
                <input type="hidden" name="talent_id" value={talentId} />
                <input type="hidden" name="budget_estimate" value="" />
                <input type="hidden" name="project_title" value={selectedType} />

                <div className="p-6 space-y-6">
                  {/* Project Type chips */}
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#cbc3d7] block mb-3">
                      Project Type
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setSelectedType(type)}
                          className={
                            selectedType === type
                              ? "px-4 py-2 rounded-full border border-[#d0bcff]/30 bg-[#d0bcff]/10 text-[#d0bcff] text-sm cursor-pointer transition-all"
                              : "px-4 py-2 rounded-full border border-white/10 bg-[#201f22] text-[#cbc3d7] text-sm hover:border-white/20 hover:text-[#e5e1e4] transition-all cursor-pointer"
                          }
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message textarea */}
                  <div>
                    <label
                      htmlFor="initial_pitch"
                      className="text-[11px] uppercase tracking-[0.1em] font-semibold text-[#cbc3d7] block mb-3"
                    >
                      Your Message
                    </label>
                    <div className="relative group">
                      <textarea
                        id="initial_pitch"
                        name="initial_pitch"
                        rows={5}
                        required
                        placeholder={`Hi ${talentName}, I love your recent work on...`}
                        className="w-full bg-[#201f22]/50 border-0 border-b-2 border-white/10 rounded-t-lg px-4 py-3 text-[#e5e1e4] focus:ring-0 focus:border-[#d0bcff] resize-none transition-colors placeholder:text-[#cbc3d7]/50 text-[16px] outline-none"
                      />
                      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#d0bcff] scale-x-0 group-focus-within:scale-x-100 transition-transform origin-left duration-300" />
                    </div>
                  </div>

                  {state.error && (
                    <p className="text-sm font-medium text-red-400">{state.error}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-[#1c1b1d]/50 border-t border-white/5 flex justify-end gap-4 items-center">
                  <button
                    type="button"
                    onClick={() => handleOpenChange(false)}
                    className="text-[11px] uppercase tracking-[0.1em] text-[#cbc3d7] hover:text-[#e5e1e4] transition-colors px-6 py-3 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <SubmitButton />
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-10 sm:p-12 text-center flex flex-col items-center gap-8 relative overflow-hidden">
                {/* Gradient highlight */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#d0bcff]/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                {/* Check icon */}
                <div className="relative w-24 h-24">
                  <div className="absolute inset-0 bg-[#d0bcff]/20 rounded-full blur-xl" />
                  <div className="relative w-full h-full border border-[#d0bcff]/30 rounded-full flex items-center justify-center bg-[#1c1b1d]/50 backdrop-blur-sm">
                    <CheckCircle2Icon
                      className="w-12 h-12 text-[#d0bcff] drop-shadow-[0_0_15px_rgba(208,188,255,0.5)]"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col gap-3 relative z-10">
                  <h2 className="font-display text-[32px] leading-[1.3] text-[#e5e1e4] font-normal">
                    Connection Request Sent
                  </h2>
                  <p className="text-[16px] text-[#cbc3d7] max-w-[280px] mx-auto">
                    They will be notified of your interest. You&apos;ll hear back if they accept.
                  </p>
                </div>

                {/* Done button */}
                <button
                  onClick={handleDone}
                  className="w-full bg-[#8B5CF6] hover:bg-[#a078ff] text-white text-[11px] uppercase tracking-widest py-4 px-8 rounded-lg transition-colors mt-4 cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
