"use client";

import { useRef, useState, useTransition } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { updateProfile } from "@/app/actions/profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { Tables } from "@/types/supabase";

type Profile = Tables<"profiles">;

interface ProfileFormProps {
  profile: Partial<Profile> | null;
  userId: string;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDiscoverable, setIsDiscoverable] = useState(
    profile?.is_discoverable ?? false
  );
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile?.avatar_url ?? null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = profile?.display_name ?? "";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image too large", {
        description: "Please choose an image under 5MB.",
      });
      e.target.value = "";
      return;
    }

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        toast.error("Upload failed", { description: uploadError.message });
        return;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(data.publicUrl);
      toast.success("Photo ready — save your profile to confirm.");
    } catch {
      toast.error("Something went wrong during upload.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  function handleSubmit(formData: FormData) {
    formData.set("is_discoverable", String(isDiscoverable));
    formData.set("avatar_url", avatarUrl ?? "");

    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile saved!");
      }
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {/* Avatar upload */}
      <div className="flex flex-col gap-2">
        <Label>Profile Photo</Label>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="group relative shrink-0 cursor-pointer rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Upload profile photo"
          >
            <Avatar className="size-20">
              <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName ? getInitials(displayName) : "?"}
              </AvatarFallback>
            </Avatar>

            {/* Camera overlay on hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {isUploading ? (
                <Loader2 className="size-5 animate-spin text-white" />
              ) : (
                <Camera className="size-5 text-white" />
              )}
            </div>
          </button>

          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-left text-sm font-medium text-primary underline-offset-4 hover:underline disabled:opacity-50"
            >
              {isUploading ? "Uploading..." : "Change photo"}
            </button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or WebP · Max 5MB
            </p>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Display Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="display_name">
          Display Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="display_name"
          name="display_name"
          placeholder="Your name"
          defaultValue={profile?.display_name ?? ""}
          required
        />
      </div>

      {/* Discoverable toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Available for Hire</span>
          <span className="text-xs text-muted-foreground">
            Make your profile visible to clients looking for talent
          </span>
        </div>
        <Switch
          id="is_discoverable"
          checked={isDiscoverable}
          onCheckedChange={setIsDiscoverable}
        />
      </div>

      {/* Conditional fields shown when discoverable */}
      {isDiscoverable && (
        <div className="flex flex-col gap-5 rounded-lg border p-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="roles">Roles</Label>
            <Input
              id="roles"
              name="roles"
              placeholder="Director, Writer, Cinematographer"
              defaultValue={profile?.roles?.join(", ") ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of your roles
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="hourly_rate">Hourly Rate (USD)</Label>
            <Input
              id="hourly_rate"
              name="hourly_rate"
              type="number"
              min={0}
              step={0.01}
              placeholder="150"
              defaultValue={profile?.hourly_rate ?? ""}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell clients about your experience and expertise..."
              defaultValue={profile?.bio ?? ""}
              rows={4}
            />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || isUploading}
        className="self-start"
      >
        {isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
