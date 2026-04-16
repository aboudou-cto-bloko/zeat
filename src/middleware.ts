import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";
import { NextResponse } from "next/server";
import { authLimiter, storefrontLimiter, globalLimiter, getIp } from "@/lib/ratelimit";

const isPublicRoute = createRouteMatcher([
  "/",
  "/restaurants",
  "/login",
  "/signup",
  "/m/(.*)",
  "/confirmation",
]);

const isAuthRoute = createRouteMatcher(["/login", "/signup"]);
const isStorefrontRoute = createRouteMatcher(["/m/(.*)"]);

// Returns a 429 response with Retry-After header.
function tooManyRequests(reset: number) {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  return new NextResponse(
    JSON.stringify({ error: "Trop de requêtes. Veuillez patienter.", retryAfter }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter > 0 ? retryAfter : 1),
      },
    }
  );
}

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // ── Redirect /search → /restaurants ──────────────────────────────────────
  if (request.nextUrl.pathname === "/search") {
    const url = request.nextUrl.clone();
    url.pathname = "/restaurants";
    return nextjsMiddlewareRedirect(request, url.toString());
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getIp(request);

  if (isAuthRoute(request) && authLimiter) {
    const { success, reset, pending } = await authLimiter.limit(`auth:${ip}`, { ip });
    void pending; // fire-and-forget analytics
    if (!success) return tooManyRequests(reset);
  } else if (isStorefrontRoute(request) && storefrontLimiter) {
    const { success, reset, pending } = await storefrontLimiter.limit(`sf:${ip}`, { ip });
    void pending;
    if (!success) return tooManyRequests(reset);
  } else if (globalLimiter) {
    const { success, reset, pending } = await globalLimiter.limit(`global:${ip}`, { ip });
    void pending;
    if (!success) return tooManyRequests(reset);
  }

  // ── Auth guards ───────────────────────────────────────────────────────────
  const isSignedIn = await convexAuth.isAuthenticated();

  if (isSignedIn && isAuthRoute(request)) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  if (!isPublicRoute(request) && !isSignedIn) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
