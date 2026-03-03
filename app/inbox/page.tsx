import { redirect } from "next/navigation"
import { InboxTabs, type ConnectionWithProfiles } from "@/components/InboxTabs"
import { createClient } from "@/utils/supabase/server"

export default async function InboxPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) redirect("/login")

  const { data: connections } = await supabase
    .from("connections")
    .select(
      `
      *,
      client:profiles!connections_client_id_fkey(display_name, avatar_url),
      talent:profiles!connections_talent_id_fkey(display_name, avatar_url)
    `
    )
    .or(`client_id.eq.${user.id},talent_id.eq.${user.id}`)
    .order("updated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your project connections and conversations.
          </p>
        </div>
        <InboxTabs
          connections={(connections ?? []) as ConnectionWithProfiles[]}
          currentUserId={user.id}
        />
      </div>
    </div>
  )
}
