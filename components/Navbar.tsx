import Link from "next/link";
import { Bookmark } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { NavUserMenu } from "@/components/NavUserMenu";
import { NavInboxBadge } from "@/components/NavInboxBadge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUnreadCount } from "@/app/actions/inbox";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("id", user.id)
        .single()
    : { data: null };

  const unreadCount = user ? await getUnreadCount() : 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
        >
          Creatorwood
        </Link>

        {/* Center nav links (logged in only) */}
        {user && (
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/discover">Discover</Link>
            </Button>
            <NavInboxBadge initialCount={unreadCount} userId={user.id} />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/saved" className="flex items-center gap-1.5">
                <Bookmark className="size-3.5" />
                Saved
              </Link>
            </Button>
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <NavUserMenu email={user.email} avatarUrl={profile?.avatar_url ?? null} displayName={profile?.display_name ?? null} />
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white" asChild>
                <Link href="/login">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
