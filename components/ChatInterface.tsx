"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { motion } from "framer-motion"
import { SendHorizonalIcon } from "lucide-react"
import { MOTION } from "@/lib/motion"
import { createClient } from "@/utils/supabase/client"
import { sendMessage } from "@/app/actions/inbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { getInitials } from "@/lib/utils"
import type { Tables } from "@/types/supabase"

export type MessageWithSender = Tables<"messages"> & {
  sender: Pick<Tables<"profiles">, "display_name" | "avatar_url">
}

interface ChatInterfaceProps {
  initialMessages: MessageWithSender[]
  connectionId: string
  currentUserId: string
  currentUser: Pick<Tables<"profiles">, "display_name" | "avatar_url">
  otherUser: Pick<Tables<"profiles">, "display_name" | "avatar_url">
}

function formatTime(timestamp: string | null) {
  if (!timestamp) return ""
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function playNotificationSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 800
    gain.gain.value = 0.08
    osc.start()
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    // AudioContext unavailable or user hasn't interacted yet
  }
}

export function ChatInterface({
  initialMessages,
  connectionId,
  currentUserId,
  currentUser,
  otherUser,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<MessageWithSender[]>(initialMessages)
  const [input, setInput] = useState("")
  const [isPending, startTransition] = useTransition()
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Track initial message count so we only animate truly new messages
  const initialCountRef = useRef(initialMessages.length)

  // Refs for typing indicator
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastTypingBroadcast = useRef(0)
  const channelRef = useRef<ReturnType<typeof createClient>["channel"] | null>(null)

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isOtherTyping])

  // Supabase Realtime: postgres_changes + typing broadcast
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`room-${connectionId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `connection_id=eq.${connectionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Tables<"messages">
          const sender =
            newMsg.sender_id === currentUserId ? currentUser : otherUser

          if (newMsg.sender_id !== currentUserId) {
            playNotificationSound()
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, { ...newMsg, sender }]
          })
        }
      )
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setIsOtherTyping(true)
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false)
          }, 3000)
        }
      })
      .subscribe()

    channelRef.current = channel as unknown as ReturnType<typeof createClient>["channel"]

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      supabase.removeChannel(channel)
    }
  }, [connectionId, currentUserId, currentUser, otherUser])

  function broadcastTyping() {
    const now = Date.now()
    if (now - lastTypingBroadcast.current < 2000) return
    lastTypingBroadcast.current = now
    const supabase = createClient()
    supabase.channel(`room-${connectionId}`).send({
      type: "broadcast",
      event: "typing",
      payload: { userId: currentUserId },
    })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content) return

    setInput("")
    startTransition(async () => {
      await sendMessage(connectionId, content)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    broadcastTyping()
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Message list */}
      <ScrollArea className="h-[500px] rounded-xl border bg-card p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No messages yet. Send the first one!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 pb-2">
            {messages.map((message, index) => {
              const isMine = message.sender_id === currentUserId
              const isNew = index >= initialCountRef.current

              return (
                <motion.div
                  key={message.id}
                  initial={isNew ? { opacity: 0, y: 16 } : false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={MOTION.duration}
                  className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage
                      src={message.sender?.avatar_url ?? undefined}
                      alt={message.sender?.display_name ?? "Unknown"}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(message.sender?.display_name ?? "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`flex max-w-[70%] flex-col gap-1 ${isMine ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm ${
                        isMine
                          ? "rounded-br-sm bg-primary text-primary-foreground"
                          : "rounded-bl-sm bg-muted text-foreground"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    </div>
                    <span className="px-1 text-xs text-muted-foreground">
                      {formatTime(message.created_at)}
                    </span>
                  </div>
                </motion.div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Typing indicator */}
      <div
        className={`flex items-center gap-2 px-2 text-sm text-muted-foreground transition-all duration-200 ${
          isOtherTyping ? "opacity-100 h-5" : "opacity-0 h-0 overflow-hidden"
        }`}
      >
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
        <span>{otherUser.display_name} is typing...</span>
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Write a message… (Enter to send, Shift+Enter for new line)"
          rows={2}
          className="resize-none"
          disabled={isPending}
        />
        <Button
          type="submit"
          size="icon-lg"
          disabled={isPending || !input.trim()}
          className="shrink-0"
        >
          <SendHorizonalIcon />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  )
}
