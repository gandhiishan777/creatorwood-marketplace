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

  // Only talent can accept or decline; both parties can mark completed
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
