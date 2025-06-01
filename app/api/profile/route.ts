import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import Profile from "@/models/Profile";
import { z } from "zod";

const ProfileSchema = z.object({
  wallet: z.string(),
  username: z.string().optional(),
  bio: z.string().optional(),
  tags: z.array(z.string()).optional(),
  role: z.enum(["learner", "teacher", "both"]).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method === "POST") {
    try {
      const parsed = ProfileSchema.parse(req.body);
      const updated = await Profile.findOneAndUpdate(
        { wallet: parsed.wallet },
        { $set: parsed },
        { new: true, upsert: true }
      );
      return res.status(200).json({ success: true, profile: updated });
    } catch (err) {
      return res.status(400).json({ success: false, error: err });
    }
  }

  if (req.method === "GET") {
    const { wallet } = req.query;
    if (!wallet || typeof wallet !== "string")
      return res.status(400).json({ success: false, error: "Wallet required" });

    const profile = await Profile.findOne({ wallet });
    if (!profile)
      return res
        .status(404)
        .json({ success: false, error: "Profile not found" });

    return res.status(200).json({ success: true, profile });
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
