import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormSubmitButton } from "@/components/FormSubmitButton";
import { login, signup } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Background pattern matching the landing page */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, color-mix(in oklch, var(--brand) 15%, transparent) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 80% 80%, color-mix(in oklch, var(--brand) 10%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-20 dark:opacity-10"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          color: "oklch(0.5 0 0)",
        }}
      />

      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-3xl tracking-tight bg-gradient-to-r from-brand to-brand/70 bg-clip-text text-transparent">
            Creatorwood
          </CardTitle>
          <CardDescription>Sign in to your account or create one</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                autoComplete="email"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                minLength={6}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive text-center rounded-md bg-destructive/10 px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <FormSubmitButton formAction={login} className="w-full bg-brand hover:bg-brand/90 text-brand-foreground">
                Sign In
              </FormSubmitButton>
              <FormSubmitButton
                formAction={signup}
                variant="outline"
                className="w-full"
              >
                Sign Up
              </FormSubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
