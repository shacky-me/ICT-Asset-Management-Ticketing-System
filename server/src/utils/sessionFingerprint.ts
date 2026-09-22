import { createHash } from "node:crypto";

// Short fingerprint of the stored password hash, carried in session tokens.
// When the password changes the fingerprint changes, so every session issued
// before the change stops working.
export function passwordFingerprint(passwordHash: string): string {
  return createHash("sha256").update(passwordHash).digest("hex").slice(0, 16);
}
