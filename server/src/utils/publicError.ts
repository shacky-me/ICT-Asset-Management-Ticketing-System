// Messages our services throw on purpose (plain `Error`) are safe to show.
// Anything else (Prisma/database errors, TypeErrors from bugs) may reveal
// internals, so the client gets a generic message and the details are logged.
export function publicErrorMessage(error: unknown, fallback: string): string {
  const isIntentional =
    error instanceof Error &&
    error.constructor === Error &&
    !("clientVersion" in error) &&
    !("code" in error);

  if (isIntentional) return error.message;

  console.error("[API] Unexpected error:", error);
  return fallback;
}
