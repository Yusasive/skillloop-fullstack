import { NextApiRequest, NextApiResponse } from "next";
import { ethers } from "ethers";
import addresses from "@/lib/contracts/addresses.json";
import abis from "@/lib/contracts/abis.json";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { wallet } = req.query;

  if (!wallet || typeof wallet !== "string")
    return res.status(400).json({ error: "Wallet is required" });

  try {
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_RPC_URL
    );
    const nft = new ethers.Contract(
      addresses.SkillBadgeNFT,
      abis.SkillBadgeNFT,
      provider
    );

    const balance = await nft.balanceOf(wallet);
    const tokens = [];

    for (let i = 0; i < balance; i++) {
      const tokenId = await nft.tokenOfOwnerByIndex(wallet, i);
      const uri = await nft.tokenURI(tokenId);
      tokens.push({ tokenId: tokenId.toString(), uri });
    }

    return res.status(200).json({ nfts: tokens });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
}
