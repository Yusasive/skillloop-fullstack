import { ethers } from "ethers";
import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

const AuthSchema = z.object({
  address: z.string(),
  message: z.string(),
  signature: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  try {
    const { address, message, signature } = AuthSchema.parse(req.body);

    const recovered = ethers.verifyMessage(message, signature);
    if (recovered.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // Optionally issue a JWT here
    return res.status(200).json({ success: true, address });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
}
