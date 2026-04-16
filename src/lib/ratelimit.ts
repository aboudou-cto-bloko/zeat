import { Ratelimit, type Duration } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Returns null when env vars are missing (local dev without Upstash).
// Middleware skips rate limiting gracefully in that case.
function createRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }
  return Redis.fromEnv();
}

const redis = createRedis();

function makeLimiter(requests: number, window: Duration) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    enableProtection: true, // auto-blocks IPs from >30 abuse lists
    analytics: true,
    prefix: "zeat",
  });
}

// /login · /signup — brute-force protection
export const authLimiter = makeLimiter(10, "60 s");

// /m/[slug] — storefront public, scraping / enumeration protection
export const storefrontLimiter = makeLimiter(60, "60 s");

// Everything else — general DDoS protection
export const globalLimiter = makeLimiter(120, "60 s");

// Extracts the real client IP from Vercel / standard proxy headers
export function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}
