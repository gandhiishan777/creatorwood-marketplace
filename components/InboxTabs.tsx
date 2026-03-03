"use client"

import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Tables } from "@/types/supabase"

export type ConnectionWithProfiles = Tables<"connections"> & {
  client: Pick<Tables<"profiles">, "display_name" | "avatar_url">
  talent: Pick<Tables<"profiles">, "display_name" | "avatar_url">
}

interface InboxTabsProps {
  connections: ConnectionWithProfiles[]
  currentUserId: string
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

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function ConnectionCard({
  connection,
  currentUserId,
}: {
  connection: ConnectionWithProfiles
  currentUserId: string
}) {
  const isClient = connection.client_id === currentUserId
  const other = isClient ? connection.talent : connection.client
  const myRole = isClient ? "Client" : "Talent"
  const badge = STATUS_BADGE[connection.status] ?? {
    label: connection.status,
    variant: "outline" as const,
  }

  const otherName = other?.display_name ?? "Unknown User"
  const otherAvatar = other?.avatar_url ?? undefined

  return (
    <Link href={`/inbox/${connection.id}`} className="group block">
      <Card className="transition-shadow group-hover:shadow-md">
        <CardContent className="flex items-center gap-4 py-4">
          <Avatar>
            <AvatarImage src={otherAvatar} alt={otherName} />
            <AvatarFallback>{getInitials(otherName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{connection.project_title}</p>
            <p className="text-sm text-muted-foreground">
              with {otherName}{" "}
              <span className="text-xs">· you are the {myRole}</span>
            </p>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </CardContent>
      </Card>
    </Link>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border bg-card py-16 text-center shadow-sm">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

export function InboxTabs({ connections, currentUserId }: InboxTabsProps) {
  const pending = connections.filter((c) => c.status === "pending")
  const active = connections.filter((c) => c.status === "active")
  const past = connections.filter(
    (c) => c.status === "declined" || c.status === "completed"
  )

  function renderList(items: ConnectionWithProfiles[], empty: string) {
    if (items.length === 0) return <EmptyState message={empty} />
    return (
      <div className="flex flex-col gap-3">
        {items.map((c) => (
          <ConnectionCard key={c.id} connection={c} currentUserId={currentUserId} />
        ))}
      </div>
    )
  }

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">
          Pending{pending.length > 0 && ` (${pending.length})`}
        </TabsTrigger>
        <TabsTrigger value="active">
          Active{active.length > 0 && ` (${active.length})`}
        </TabsTrigger>
        <TabsTrigger value="past">Past</TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        {renderList(pending, "No pending connections.")}
      </TabsContent>
      <TabsContent value="active" className="mt-4">
        {renderList(active, "No active connections.")}
      </TabsContent>
      <TabsContent value="past" className="mt-4">
        {renderList(past, "No past connections.")}
      </TabsContent>
    </Tabs>
  )
}
