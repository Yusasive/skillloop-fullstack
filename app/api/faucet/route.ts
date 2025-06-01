import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import addresses from "@/lib/contracts/addresses.json";
import abis from "@/lib/contracts/abis.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Only POST allowed" });

  const { wallet } = req.body;
  if (!wallet || typeof wallet !== "string")
    return res.status(400).json({ error: "Wallet required" });

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
    const token = new ethers.Contract(
      addresses.SkillToken,
      abis.SkillToken,
      signer
    );

    const tx = await token.faucet(wallet);
    await tx.wait();

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
