import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getSessions,
  createSession,
  getUserByAddress,
  updateUserTokenBalance,
  createTokenTransaction,
  createNotification,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const tutorId = searchParams.get("tutorId");
    const learnerId = searchParams.get("learnerId");
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    let filter: any = {};
    if (tutorId) filter.tutorId = tutorId;
    if (learnerId) filter.learnerId = learnerId;
    if (status) filter.status = status;

    // If userId is provided, get sessions where user is either tutor or learner
    // userId here is actually the wallet address, so we need to find by address
    if (userId) {
      const user = await getUserByAddress(userId);
      if (user) {
        filter = {
          $or: [
            { tutorId: user.id },
            { learnerId: user.id },
            { tutorAddress: userId }, // Also check by address for backward compatibility
            { learnerAddress: userId },
          ],
        };
      } else {
        // If user not found, return empty array
        return NextResponse.json({ sessions: [] });
      }
    }

    const sessions = await getSessions(filter, limit, skip);

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sessions" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tutorAddress,
      learnerAddress,
      skillName,
      startTime,
      endTime,
      duration,
      tokenAmount,
      description,
    } = body;

    if (
      !tutorAddress ||
      !learnerAddress ||
      !skillName ||
      !startTime ||
      !endTime ||
      !tokenAmount
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate token amount is within acceptable range (5-20 SKL per hour)
    const hourlyRate = tokenAmount / (duration / 60);
    if (hourlyRate < 5 || hourlyRate > 20) {
      return NextResponse.json(
        { error: "Hourly rate must be between 5-20 SKL per hour" },
        { status: 400 }
      );
    }

    // Validate tutor and learner exist and get their IDs
    const tutor = await getUserByAddress(tutorAddress);
    const learner = await getUserByAddress(learnerAddress);

    if (!tutor || !learner) {
      return NextResponse.json(
        { error: "Tutor or learner not found" },
        { status: 404 }
      );
    }

    // Check if learner has sufficient token balance
    if (learner.tokenBalance < tokenAmount) {
      return NextResponse.json(
        {
          error: `Insufficient SKL tokens. You have ${learner.tokenBalance} SKL but need ${tokenAmount} SKL`,
        },
        { status: 400 }
      );
    }

    // Deduct tokens from learner's account (escrow)
    const updatedLearner = await updateUserTokenBalance(
      learnerAddress,
      tokenAmount,
      "subtract"
    );

    if (!updatedLearner) {
      return NextResponse.json(
        { error: "Failed to deduct tokens from learner account" },
        { status: 500 }
      );
    }

    // Create session with "requested" status
    const sessionId = uuidv4();
    const newSession = await createSession({
      id: sessionId,
      tutorId: tutor.id,
      learnerId: learner.id,
      tutorAddress: tutorAddress, // Store addresses for easier lookup
      learnerAddress: learnerAddress,
      skillName,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: duration || 60,
      tokenAmount: tokenAmount,
      description: description || "",
      status: "requested", // Session needs tutor approval
    });

    // Create token transaction record
    await createTokenTransaction({
      id: uuidv4(),
      fromAddress: learnerAddress,
      toAddress: tutorAddress,
      amount: tokenAmount,
      type: "booking",
      sessionId: sessionId,
      status: "pending", // Will be completed when session is finished
    });

    // Create notification for tutor
    await createNotification({
      id: uuidv4(),
      userId: tutor.id,
      type: "session_request",
      title: "New Session Request",
      message: `${learner.username || "A student"} wants to book a ${skillName} session with you`,
      data: { sessionId, learnerName: learner.username, skillName },
      read: false,
    });

    return NextResponse.json(
      {
        session: newSession,
        message: `${tokenAmount} SKL tokens have been deducted and held in escrow. Waiting for tutor approval.`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create session" },
      { status: 500 }
    );
  }
}
