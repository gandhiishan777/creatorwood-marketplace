import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChatInterface, type MessageWithSender } from "@/components/ChatInterface"
import { updateConnectionStatus } from "@/app/actions/inbox"
import { createClient } from "@/utils/supabase/server"
import type { Tables } from "@/types/supabase"

interface RoomPageProps {
  params: Promise<{ id: string }>
}

const STATUS_BADGE: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  pending: { label: "Pending", variant: "outline" },
  active: { label: "Active", variant: "default" },
  declined: { label: "Declined", variant: "secondary" },
  completed: { label: "Completed", variant: "secondary" },
}

export default async function InboxRoomPage({ params }: RoomPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) redirect("/login")

  const { data: connection } = await supabase
    .from("connections")
    .select(
      `
      *,
      client:profiles!connections_client_id_fkey(id, display_name, avatar_url),
      talent:profiles!connections_talent_id_fkey(id, display_name, avatar_url)
    `
    )
    .eq("id", id)
    .single()

  if (!connection) redirect("/inbox")
  if (connection.client_id !== user.id && connection.talent_id !== user.id) {
    redirect("/inbox")
  }

  const { data: messagesRaw } = await supabase
    .from("messages")
    .select(`*, sender:profiles!messages_sender_id_fkey(display_name, avatar_url)`)
    .eq("connection_id", id)
    .order("created_at", { ascending: true })

  const isTalent = connection.talent_id === user.id
  const isClient = connection.client_id === user.id

  type ProfileSnippet = Pick<Tables<"profiles">, "display_name" | "avatar_url">
  const UNKNOWN_PROFILE: ProfileSnippet = { display_name: "Unknown User", avatar_url: null }

  const currentUserProfile: ProfileSnippet =
    ((isTalent ? connection.talent : connection.client) as ProfileSnippet | null) ??
    UNKNOWN_PROFILE
  const otherUserProfile: ProfileSnippet =
    ((isTalent ? connection.client : connection.talent) as ProfileSnippet | null) ??
    UNKNOWN_PROFILE

  const badge = STATUS_BADGE[connection.status] ?? {
    label: connection.status,
    variant: "outline" as const,
  }

  const acceptAction = updateConnectionStatus.bind(null, id, "active")
  const declineAction = updateConnectionStatus.bind(null, id, "declined")
  const completeAction = updateConnectionStatus.bind(null, id, "completed")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight">
                {connection.project_title}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {isTalent
                  ? `Pitch from ${otherUserProfile.display_name}`
                  : `Your pitch to ${otherUserProfile.display_name}`}
              </p>
            </div>
            <Badge variant={badge.variant} className="shrink-0">
              {badge.label}
            </Badge>
          </div>

          {/* Talent action buttons — accept / decline */}
          {connection.status === "pending" && isTalent && (
            <div className="flex gap-2">
              <form action={acceptAction}>
                <Button type="submit" size="sm">
                  Accept Pitch
                </Button>
              </form>
              <form action={declineAction}>
                <Button type="submit" variant="outline" size="sm">
                  Decline
                </Button>
              </form>
            </div>
          )}

          {/* Either party can mark completed */}
          {connection.status === "active" && (isClient || isTalent) && (
            <div className="flex gap-2">
              <form action={completeAction}>
                <Button type="submit" variant="secondary" size="sm">
                  Mark as Completed
                </Button>
              </form>
            </div>
          )}
        </div>

        <Separator className="mb-6" />

        <ChatInterface
          initialMessages={(messagesRaw ?? []) as MessageWithSender[]}
          connectionId={id}
          currentUserId={user.id}
          currentUser={currentUserProfile}
          otherUser={otherUserProfile}
        />
      </div>
    </div>
  )
}
