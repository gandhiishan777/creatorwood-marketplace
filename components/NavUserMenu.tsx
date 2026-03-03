"use client";

import Link from "next/link";
import { User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";

interface NavUserMenuProps {
  email?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
}

export function NavUserMenu({ email, displayName, avatarUrl }: NavUserMenuProps) {
  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : email
      ? email.slice(0, 2).toUpperCase()
      : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9 rounded-full">
          <Avatar className="w-8 h-8">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName ?? email ?? ""} />
            <AvatarFallback className="bg-indigo-600 text-white text-xs font-semibold">
              {initials ?? <User className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {email && (
          <>
            <div className="px-2 py-1.5">
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem asChild>
          <Link href="/settings">Profile Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOut} className="w-full">
            <button type="submit" className="w-full text-left text-destructive">
              Sign Out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
