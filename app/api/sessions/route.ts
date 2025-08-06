import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { validateRequest, createSessionSchema } from "@/lib/validation";
import { handleApiError } from "@/lib/error-handler";
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

    // Validate pagination
    if (limit > 100) {
      return NextResponse.json(
        { error: 'Limit cannot exceed 100' },
        { status: 400 }
      );
    }
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request body
    const validatedData = validateRequest(createSessionSchema, body);
    const {
      tutorAddress,
      learnerAddress,
      skillName,
      startTime,
      endTime,
      duration,
      tokenAmount,
      description,
    } = validatedData;


    // Validate token amount is within acceptable range (5-20 SKL per hour)
    const hourlyRate = tokenAmount / (duration / 60);
    if (hourlyRate < 5 || hourlyRate > 20) {
      return NextResponse.json(
        { error: "Hourly rate must be between 5-20 SKL per hour" },
        { status: 400 }
      );
    }

    // Validate session timing
    const sessionStart = new Date(startTime);
    const sessionEnd = new Date(endTime);
    const now = new Date();
    
    if (sessionStart <= now) {
      return NextResponse.json(
        { error: "Session start time must be in the future" },
        { status: 400 }
      );
    }
    
    if (sessionEnd <= sessionStart) {
      return NextResponse.json(
        { error: "Session end time must be after start time" },
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

    // Prevent self-booking
    if (tutorAddress.toLowerCase() === learnerAddress.toLowerCase()) {
      return NextResponse.json(
        { error: "Cannot book a session with yourself" },
        { status: 400 }
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
      startTime: sessionStart,
      endTime: sessionEnd,
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
    const { message, statusCode } = handleApiError(error);
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
