import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import Session from "@/models/Session";
import { getSkillEscrowContract } from "@/lib/contracts";
import { ethers } from "ethers";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();
  const { id } = req.query;

  if (!id || typeof id !== "string")
    return res.status(400).json({ error: "Invalid ID" });

  if (req.method === "GET") {
    const session = await Session.findOne({ escrowId: id });
    if (!session) return res.status(404).json({ error: "Session not found" });
    return res.status(200).json({ session });
  }

  if (req.method === "POST") {
    try {
      const provider = new ethers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
      const escrow = getSkillEscrowContract(signer);

      const tx = await escrow.confirmSession(id);
      await tx.wait();

      await Session.updateOne({ escrowId: id }, { confirmed: true });

      return res.status(200).json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
