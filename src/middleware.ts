import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/restaurants",
  "/login",
  "/signup",
  "/m/(.*)",
  "/confirmation",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isSignedIn = await convexAuth.isAuthenticated();

  // Redirect authenticated users away from auth pages
  if (isSignedIn && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/signup")) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  // Protect dashboard routes
  if (!isPublicRoute(request) && !isSignedIn) {
    return nextjsMiddlewareRedirect(request, "/login");
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
