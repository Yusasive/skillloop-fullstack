import { getIronSession } from "iron-session";
import { ironOptions } from "@/lib/auth/session";

export async function requireAuth(req, res) {
  const session = await getIronSession(req, res, ironOptions);
  if (!session.siwe?.address) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return session.siwe.address;
}
