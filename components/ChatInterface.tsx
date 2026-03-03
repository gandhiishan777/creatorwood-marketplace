"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { SendHorizonalIcon } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { sendMessage } from "@/app/actions/inbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
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

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function formatTime(timestamp: string | null) {
  if (!timestamp) return ""
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
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
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Supabase Realtime subscription
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
          setMessages((prev) => {
            // Deduplicate: skip if a message with this ID already exists
            if (prev.some((m) => m.id === newMsg.id)) return prev
            return [...prev, { ...newMsg, sender }]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [connectionId, currentUserId, currentUser, otherUser])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const content = input.trim()
    if (!content) return

    setInput("")
    startTransition(async () => {
      await sendMessage(connectionId, content)
      // Realtime subscription will deliver the new message
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent)
    }
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
            {messages.map((message) => {
              const isMine = message.sender_id === currentUserId
              return (
                <div
                  key={message.id}
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
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
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
