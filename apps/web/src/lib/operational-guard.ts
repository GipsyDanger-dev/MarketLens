export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function createRateLimiter(options: {
  limit: number;
  windowMilliseconds: number;
  now?: () => number;
}) {
  const entries = new Map<string, { count: number; resetAt: number }>();
  const now = options.now ?? Date.now;
  return {
    consume(key: string): RateLimitResult {
      const timestamp = now();
      const current = entries.get(key);
      if (!current || current.resetAt <= timestamp) {
        entries.set(key, {
          count: 1,
          resetAt: timestamp + options.windowMilliseconds,
        });
        return {
          allowed: true,
          retryAfterSeconds: Math.ceil(options.windowMilliseconds / 1000),
        };
      }
      current.count += 1;
      return {
        allowed: current.count <= options.limit,
        retryAfterSeconds: Math.max(
          1,
          Math.ceil((current.resetAt - timestamp) / 1000),
        ),
      };
    },
  };
}

const researchRateLimiter = createRateLimiter({
  limit: 20,
  windowMilliseconds: 60_000,
});

const aiInsightRateLimiter = createRateLimiter({
  limit: 5,
  windowMilliseconds: 60_000,
});

export function guardResearchMutation(
  request: Request,
  scope: string,
): RateLimitResult {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return researchRateLimiter.consume(`${scope}:${forwarded || "unknown"}`);
}

/** Limits billable AI generation across this local process. */
export function guardAiInsightGeneration(): RateLimitResult {
  return aiInsightRateLimiter.consume("ai-insight-generation");
}

export function logOperationalEvent(
  event: string,
  fields: Record<string, string | number | boolean | undefined> = {},
) {
  console.info(
    JSON.stringify({
      level: "info",
      event,
      timestamp: new Date().toISOString(),
      ...fields,
    }),
  );
}
