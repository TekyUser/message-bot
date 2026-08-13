import { cookies } from "next/headers";
import { createHmac } from "node:crypto";

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get("admin_session")?.value;

  if (!value) return false;

  const [timestamp, signature] = value.split(".");
  if (!timestamp || !signature) return false;

  const timestampNumber = Number(timestamp);
  if (!Number.isFinite(timestampNumber)) return false;

  const maxAge = 60 * 60 * 24 * 7 * 1000;
  if (Date.now() - timestampNumber > maxAge) return false;

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return false;

  const expected = createHmac("sha256", secret)
    .update(timestamp)
    .digest("hex");

  return signature === expected;
}
