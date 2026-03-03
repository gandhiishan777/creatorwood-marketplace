"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { motion } from "framer-motion"
import { SendHorizonalIcon, Sparkles, Star } from "lucide-react"
import { MOTION, fadeUp } from "@/lib/motion"
import type { UIMessage } from "ai"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { getInitials } from "@/lib/utils"
import type { TalentCardProfile } from "@/components/TalentCard"

interface AIConciergeCardProps {
  profile: TalentCardProfile
}

function AIConciergeCard({ profile }: AIConciergeCardProps) {
  return (
    <motion.div {...fadeUp}>
      <Link
        href={`/profile/${profile.id}`}
        target="_blank"
        className="flex items-center gap-3 rounded-lg border bg-card/50 p-3 transition-colors hover:bg-accent"
      >
        <Avatar className="size-10 shrink-0">
          <AvatarImage
            src={profile.avatar_url ?? undefined}
            alt={profile.display_name}
          />
          <AvatarFallback className="text-xs">
            {getInitials(profile.display_name)}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">
              {profile.display_name}
            </p>
            {profile.avg_rating != null && profile.review_count > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400">
                <Star className="size-3 fill-amber-500 text-amber-500" />
                {profile.avg_rating}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {profile.hourly_rate != null
                ? `$${profile.hourly_rate}/hr`
                : "Rate negotiable"}
            </span>
            {profile.roles && profile.roles.length > 0 && (
              <>
                <span className="text-border">·</span>
                <div className="flex gap-1">
                  {profile.roles.slice(0, 2).map((role) => (
                    <Badge
                      key={role}
                      variant="secondary"
                      className="px-1.5 py-0 text-[10px]"
                    >
                      {role}
                    </Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface AIConcierePanelProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  profiles: TalentCardProfile[]
}

const WELCOME_ID = "welcome"

const welcomeMessage: UIMessage = {
  id: WELCOME_ID,
  role: "assistant",
  parts: [
    {
      type: "text",
      text: "Hi! I'm your AI casting assistant. Tell me about your project — budget, style, timeline — and I'll recommend the best creators on Creatorwood for you.",
    },
  ],
}

export function AIConciergePanel({
  open,
  onOpenChange,
  profiles,
}: AIConcierePanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const [input, setInput] = useState("")

  const { messages, sendMessage, setMessages, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
    messages: [welcomeMessage],
  })

  const isLoading = status === "streaming" || status === "submitted"

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (!open) {
      setMessages([welcomeMessage])
      setInput("")
    }
  }, [open, setMessages])

  const profilesById = new Map(profiles.map((p) => [p.id, p]))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading) return
    setInput("")
    sendMessage({ text })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton
        className="flex w-full flex-col overflow-hidden sm:max-w-[450px]"
      >
        <SheetHeader className="border-b border-brand/20 pb-3">
          <SheetTitle className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-full bg-brand/10">
              <Sparkles className="size-4 text-brand" />
            </div>
            AI Casting Assistant
          </SheetTitle>
          <SheetDescription>
            Describe your project and I&apos;ll find the right creator.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-4 px-4">
          <div className="flex flex-col gap-4 py-4">
            {messages.map((message) => {
              const isUser = message.role === "user"

              const textParts = message.parts.filter(
                (p): p is Extract<typeof p, { type: "text" }> =>
                  p.type === "text"
              )
              const textContent = textParts.map((p) => p.text).join("")

              if (!isUser && message.parts.length > 0) {
                console.log("[AI Parts]", JSON.stringify(message.parts.map(p => ({ type: p.type, ...("toolName" in p ? { toolName: (p as Record<string, unknown>).toolName } : {}) }))))
              }

              const toolParts: Array<{ profileIds: string[] }> = []
              for (const p of message.parts) {
                const part = p as unknown as Record<string, unknown>

                const isTypedTool = p.type === "tool-showCreatorCards"
                const isDynamicTool =
                  p.type === "dynamic-tool" &&
                  (part.toolName as string) === "showCreatorCards"

                if (!isTypedTool && !isDynamicTool) continue

                const input = (part.input ?? part.args) as
                  | { profileIds?: unknown }
                  | undefined
                if (input != null && Array.isArray(input.profileIds)) {
                  toolParts.push({ profileIds: input.profileIds as string[] })
                }
              }

              return (
                <div key={message.id} className="flex flex-col gap-2">
                  {textContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={MOTION.duration}
                      className={`flex items-end gap-2 ${
                        isUser ? "flex-row-reverse" : "flex-row"
                      }`}
                    >
                      {!isUser && (
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10">
                          <Sparkles className="size-3.5 text-brand" />
                        </div>
                      )}

                      <div
                        className={`max-w-[80%] overflow-hidden rounded-2xl px-4 py-2.5 text-sm ${
                          isUser
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm bg-muted text-foreground"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {textContent}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {toolParts.length > 0 && (
                    <div className="ml-9 flex flex-col gap-2">
                      {toolParts.flatMap((part) => {
                        const ids = part.profileIds
                        return ids.map((profileId: string) => {
                          const profile = profilesById.get(profileId)
                          if (!profile) return null
                          return (
                            <AIConciergeCard
                              key={profileId}
                              profile={profile}
                            />
                          )
                        })
                      })}
                    </div>
                  )}
                </div>
              )
            })}

            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-end gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10">
                  <Sparkles className="size-3.5 text-brand animate-pulse" />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5">
                  <span className="flex gap-1">
                    <span
                      className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="size-1.5 rounded-full bg-muted-foreground animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </span>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        <form
          onSubmit={handleSubmit}
          className="flex items-end gap-2 border-t pt-4"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your project..."
            rows={2}
            className="resize-none"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size="icon-lg"
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            <SendHorizonalIcon />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  )
}
