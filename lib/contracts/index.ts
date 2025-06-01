import { Contract, JsonRpcProvider, Signer, ethers } from "ethers";
import abiMap from "./abis.json";
import addressMap from "./addresses.json";
import skillTokenABI from "@/lib/contracts/abis.json";
import addresses from "@/lib/contracts/addresses.json";


export const getContract = (
  name: keyof typeof abiMap,
  providerOrSigner: Signer | JsonRpcProvider
) => {
  const abi = abiMap[name];
  const address = addressMap[name];
  return new Contract(address, abi, providerOrSigner);
};

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

export const getSkillTokenContract = () =>
  new ethers.Contract(addresses.SkillToken, skillTokenABI.SkillToken, signer);

export const getSkillEscrowContract = (signer: ethers.Wallet) =>
  new ethers.Contract(addresses.SkillEscrow, skillTokenABI.SkillEscrow, signer);

export const getSkillBadgeContract = () =>
  new ethers.Contract(addresses.SkillBadgeNFT, skillTokenABI.SkillBadgeNFT, signer);