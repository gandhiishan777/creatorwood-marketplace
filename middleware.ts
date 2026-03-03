import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

const PROTECTED_ROUTES = ["/settings", "/inbox", "/saved"];

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (
    user &&
    !pathname.startsWith("/settings") &&
    !pathname.startsWith("/login")
  ) {
    const profileComplete = request.cookies.get("cw_profile_complete");
    if (!profileComplete) {
      const onboardingUrl = request.nextUrl.clone();
      onboardingUrl.pathname = "/settings";
      onboardingUrl.searchParams.set("onboarding", "true");
      return NextResponse.redirect(onboardingUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
