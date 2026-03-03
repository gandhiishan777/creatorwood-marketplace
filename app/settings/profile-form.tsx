"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { updateProfile } from "@/app/actions/profile";
import type { Tables } from "@/types/supabase";

type Profile = Tables<"profiles">;

interface ProfileFormProps {
  profile: Partial<Profile> | null;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isDiscoverable, setIsDiscoverable] = useState(
    profile?.is_discoverable ?? false
  );

  function handleSubmit(formData: FormData) {
    formData.set("is_discoverable", String(isDiscoverable));

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

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  );
}
