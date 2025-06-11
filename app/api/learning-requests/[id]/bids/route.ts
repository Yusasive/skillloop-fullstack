import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getLearningRequestById,
  addBidToLearningRequest,
  getUserByAddress,
  createNotification,
} from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const learningRequestId = params.id;
    const body = await req.json();
    const {
      tutorAddress,
      proposedRate,
      proposedDuration,
      message,
      availableSlots,
    } = body;

    if (!tutorAddress || !proposedRate || !proposedDuration || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get learning request
    const learningRequest = await getLearningRequestById(learningRequestId);
    if (!learningRequest) {
      return NextResponse.json(
        { error: "Learning request not found" },
        { status: 404 }
      );
    }

    if (learningRequest.status !== "open") {
      return NextResponse.json(
        { error: "Learning request is not open for bids" },
        { status: 400 }
      );
    }

    // Validate tutor exists
    const tutor = await getUserByAddress(tutorAddress);
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    // Check if tutor already has a pending bid
    const existingBid = learningRequest.bids.find(
      (bid) => bid.tutorAddress === tutorAddress && bid.status === "pending"
    );

    if (existingBid) {
      return NextResponse.json(
        { error: "You already have a pending bid for this request" },
        { status: 400 }
      );
    }

    // Calculate total cost
    const totalCost = (proposedRate * proposedDuration) / 60;

    // Validate against max budget
    if (totalCost > learningRequest.maxBudget) {
      return NextResponse.json(
        {
          error: `Total cost (${totalCost} SKL) exceeds maximum budget (${learningRequest.maxBudget} SKL)`,
        },
        { status: 400 }
      );
    }

    // Create bid
    const newBid = {
      id: uuidv4(),
      learningRequestId,
      tutorId: tutor.id,
      tutorAddress,
      proposedRate,
      proposedDuration,
      totalCost,
      message,
      availableSlots: availableSlots || [],
      status: "pending" as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add bid to learning request
    const updatedLearningRequest = await addBidToLearningRequest(
      learningRequestId,
      newBid
    );

    // Create notification for the student
    await createNotification({
      id: uuidv4(),
      userId: learningRequest.userId,
      type: "new_bid",
      title: "New Bid Received!",
      message: `${tutor.username || "A tutor"} has submitted a bid for your ${learningRequest.skillName} learning request`,
      data: {
        learningRequestId,
        bidId: newBid.id,
        tutorName: tutor.username,
        skillName: learningRequest.skillName,
        totalCost,
      },
      read: false,
    });

    return NextResponse.json(
      {
        bid: newBid,
        message: "Bid submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating bid:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create bid" },
      { status: 500 }
    );
  }
}
