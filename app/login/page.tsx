import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { login, signup } from "@/app/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Creatorwood</CardTitle>
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
              <Button formAction={login} type="submit" className="w-full">
                Sign In
              </Button>
              <Button
                formAction={signup}
                type="submit"
                variant="outline"
                className="w-full"
              >
                Sign Up
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
