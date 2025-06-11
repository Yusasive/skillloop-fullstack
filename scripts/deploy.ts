import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment...");

  try {
    // Deploy SkillLoopToken
    console.log("Deploying SkillLoopToken...");
    const SkillLoopToken = await ethers.getContractFactory("SkillLoopToken");
    const token = await SkillLoopToken.deploy();
    await token.deployed();
    console.log("SkillLoopToken deployed to:", token.address);

    // Deploy SkillLoopEscrow
    console.log("Deploying SkillLoopEscrow...");
    const SkillLoopEscrow = await ethers.getContractFactory("SkillLoopEscrow");
    const escrow = await SkillLoopEscrow.deploy();
    await escrow.deployed();
    console.log("SkillLoopEscrow deployed to:", escrow.address);

    // Deploy SkillLoopCertificate
    console.log("Deploying SkillLoopCertificate...");
    const SkillLoopCertificate = await ethers.getContractFactory("SkillLoopCertificate");
    const certificate = await SkillLoopCertificate.deploy(escrow.address);
    await certificate.deployed();
    console.log("SkillLoopCertificate deployed to:", certificate.address);

    console.log("\nDeployment Summary:");
    console.log("-------------------");
    console.log("SkillLoopToken:", token.address);
    console.log("SkillLoopEscrow:", escrow.address);
    console.log("SkillLoopCertificate:", certificate.address);
    
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });