import { NextRequest, NextResponse } from "next/server";
import { getCertificates, updateCertificate } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { certificateId } = body;

    if (!certificateId) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

    // Get certificate details
    const certificates = await getCertificates({ id: certificateId }, 1, 0);
    const certificate = certificates[0];

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    if (certificate.status !== "pending") {
      return NextResponse.json(
        { error: "Certificate is not in pending status" },
        { status: 400 }
      );
    }

    // Generate mock NFT data (in real implementation, this would interact with smart contract)
    const tokenId = Math.floor(Math.random() * 1000000).toString();
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
    const metadataUri = `https://skillloop.xyz/certificates/${certificateId}/metadata.json`;

    // Update certificate with minting information
    const updatedCertificate = await updateCertificate(certificateId, {
      tokenId,
      txHash,
      metadataUri,
      status: "minted",
    });

    return NextResponse.json({
      certificate: updatedCertificate,
      message: "Certificate minted successfully as NFT!",
    });
  } catch (error: any) {
    console.error("Error minting certificate:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mint certificate" },
      { status: 500 }
    );
  }
}
