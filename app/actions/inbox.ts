"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/utils/supabase/server"
import type { TablesInsert } from "@/types/supabase"

export async function sendMessage(
  connectionId: string,
  content: string
): Promise<{ error: string | null }> {
  if (!content?.trim()) return { error: "Message cannot be empty." }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Not authenticated." }

  const { data: connection } = await supabase
    .from("connections")
    .select("client_id, talent_id")
    .eq("id", connectionId)
    .single()

  if (
    !connection ||
    (connection.client_id !== user.id && connection.talent_id !== user.id)
  ) {
    return { error: "Not authorized to send messages in this connection." }
  }

  const payload: TablesInsert<"messages"> = {
    connection_id: connectionId,
    sender_id: user.id,
    content: content.trim(),
  }

  const { error } = await supabase.from("messages").insert(payload)

  if (error) return { error: error.message }

  return { error: null }
}

export async function updateConnectionStatus(
  connectionId: string,
  status: "active" | "declined" | "completed"
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Not authenticated." }

  const { data: connection } = await supabase
    .from("connections")
    .select("talent_id, client_id")
    .eq("id", connectionId)
    .single()

  if (!connection) return { error: "Connection not found." }

  if (
    (status === "active" || status === "declined") &&
    connection.talent_id !== user.id
  ) {
    return { error: "Only the talent can accept or decline a connection." }
  }

  if (
    status === "completed" &&
    connection.talent_id !== user.id &&
    connection.client_id !== user.id
  ) {
    return { error: "Not authorized." }
  }

  const { error } = await supabase
    .from("connections")
    .update({ status })
    .eq("id", connectionId)

  if (error) return { error: error.message }

  revalidatePath("/inbox")
  revalidatePath(`/inbox/${connectionId}`)
  return { error: null }
}

export async function markConnectionRead(
  connectionId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) return { error: "Not authenticated." }

  const { data: connection } = await supabase
    .from("connections")
    .select("client_id, talent_id")
    .eq("id", connectionId)
    .single()

  if (!connection) return { error: "Connection not found." }

  const isClient = connection.client_id === user.id
  const isTalent = connection.talent_id === user.id

  if (!isClient && !isTalent) return { error: "Not authorized." }

  const column = isClient ? "client_last_read_at" : "talent_last_read_at"
  const { error } = await supabase
    .from("connections")
    .update({ [column]: new Date().toISOString() })
    .eq("id", connectionId)

  if (error) return { error: error.message }

  revalidatePath("/inbox")
  return { error: null }
}

export async function getUnreadCount(): Promise<number> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return 0

  const { data: connections } = await supabase
    .from("connections")
    .select("id, client_id, talent_id, client_last_read_at, talent_last_read_at")
    .or(`client_id.eq.${user.id},talent_id.eq.${user.id}`)

  if (!connections || connections.length === 0) return 0

  let total = 0

  for (const conn of connections) {
    const isClient = conn.client_id === user.id
    const lastRead = isClient ? conn.client_last_read_at : conn.talent_last_read_at

    let msgQuery = supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("connection_id", conn.id)
      .neq("sender_id", user.id)

    if (lastRead) {
      msgQuery = msgQuery.gt("created_at", lastRead)
    }

    const { count } = await msgQuery
    total += count ?? 0
  }

  return total
}
