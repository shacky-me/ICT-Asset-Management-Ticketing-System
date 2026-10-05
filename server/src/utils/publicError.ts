// Messages our services throw on purpose (plain `Error`) are safe to show.
// Anything else (Prisma/database errors, TypeErrors from bugs) may reveal
// internals, so the client gets a generic message and the details are logged.
// True for the messages our own services throw for the user to read.
export function isIntentionalError(error: unknown): error is Error {
  return (
    error instanceof Error &&
    error.constructor === Error &&
    !("clientVersion" in error) &&
    !("code" in error)
  );
}

export function publicErrorMessage(error: unknown, fallback: string): string {
  const isIntentional = isIntentionalError(error);

  if (isIntentional) return error.message;

  console.error("[API] Unexpected error:", error);
  return fallback;
}
