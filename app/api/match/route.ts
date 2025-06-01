import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import Profile from "@/models/Profile";
import { z } from "zod";

const MatchInput = z.object({
  wallet: z.string(),
  tags: z.array(z.string()).nonempty(),
  role: z.enum(["learner", "teacher", "both"]),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { wallet, tags, role } = MatchInput.parse(req.body);

    const oppositeRole = role === "learner" ? "teacher" : "learner";

    const matches = await Profile.find({
      wallet: { $ne: wallet },
      tags: { $in: tags },
      $or: [{ role: oppositeRole }, { role: "both" }],
    }).limit(10);

    return res.status(200).json({ matches });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
}
