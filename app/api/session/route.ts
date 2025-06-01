import type { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "@/lib/db/mongoose";
import Session from "@/models/Session";
import { getSkillEscrowContract } from "@/lib/contracts";
import { z } from "zod";
import { ethers } from "ethers";
import SessionLog from "@/models/SessionLog";

const SessionInput = z.object({
  learner: z.string(),
  teacher: z.string(),
  tags: z.array(z.string()),
  amount: z.string(), // in wei
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await connectToDatabase();

  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { learner, teacher, tags, amount } = SessionInput.parse(req.body);

    await SessionLog.create({
      wallet: learner,
      action: "created",
    });

    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const escrow = getSkillEscrowContract(signer);

    const tx = await escrow.createSession(learner, teacher, amount);
    const receipt = await tx.wait();
    const event = receipt.logs?.find(
      (log: { fragment: { name: string } }) =>
        log.fragment?.name === "SessionCreated"
    );

    const escrowId = event?.args?.sessionId?.toNumber() || 0;

    const session = await Session.create({
      learner,
      teacher,
      tags,
      amount,
      escrowId,
    });

    return res.status(200).json({ session });
  } catch (err) {
    return res.status(400).json({ error: err });
  }
}
