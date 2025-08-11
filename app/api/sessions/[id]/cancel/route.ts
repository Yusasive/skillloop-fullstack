import { NextRequest, NextResponse } from "next/server";
import {
  getSessionById,
  updateSession,
  getUserByAddress,
  updateUserTokenBalance,
  updateTokenTransaction,
  createNotification,
} from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: any
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { canceledBy, reason } = body; // Address of user canceling and reason

    if (!sessionId || !canceledBy || !reason) {
      return NextResponse.json(
        { error: "Session ID, canceledBy address, and reason are required" },
        { status: 400 }
      );
    }

    // Get session details
    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel completed session" },
        { status: 400 }
      );
    }

    if (session.status === "canceled") {
      return NextResponse.json(
        { error: "Session already canceled" },
        { status: 400 }
      );
    }

    // Get tutor and learner details using addresses
    let tutor, learner;

    if (session.tutorAddress && session.learnerAddress) {
      tutor = await getUserByAddress(session.tutorAddress);
      learner = await getUserByAddress(session.learnerAddress);
    } else {
      // Fallback to ID lookup
      tutor = await getUserByAddress(session.tutorId);
      learner = await getUserByAddress(session.learnerId);
    }

    if (!tutor || !learner) {
      return NextResponse.json(
        { error: "Tutor or learner not found" },
        { status: 404 }
      );
    }

    // Verify that the person canceling is either tutor or learner
    if (canceledBy !== tutor.address && canceledBy !== learner.address) {
      return NextResponse.json(
        { error: "Only session participants can cancel" },
        { status: 403 }
      );
    }

    // Determine who is canceling
    const isTutorCanceling = canceledBy === tutor.address;
    const canceledByUser = isTutorCanceling ? tutor : learner;
    const otherUser = isTutorCanceling ? learner : tutor;

    // Mark session as canceled with reason
    const updatedSession = await updateSession(sessionId, {
      status: "canceled",
      cancellationReason: reason,
      canceledBy: canceledBy,
    });

    // Refund tokens to learner (always refund on cancellation)
    await updateUserTokenBalance(learner.address, session.tokenAmount, "add");

    // Update token transaction status
    await updateTokenTransaction(sessionId, {
      status: "failed",
    });

    // Create notification for the other participant
    await createNotification({
      id: uuidv4(),
      userId: otherUser.id,
      type: "session_canceled",
      title: "Session Canceled",
      message: `Your ${session.skillName} session has been canceled by ${canceledByUser.username || "the other participant"}. ${session.tokenAmount} SKL tokens have been refunded.`,
      data: {
        sessionId,
        canceledByName: canceledByUser.username,
        skillName: session.skillName,
        reason,
        tokenAmount: session.tokenAmount,
      },
      read: false,
    });

    return NextResponse.json({
      session: updatedSession,
      message: `Session canceled. ${session.tokenAmount} SKL tokens have been refunded to the learner.`,
    });
  } catch (error: any) {
    console.error("Error canceling session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to cancel session" },
      { status: 500 }
    );
  }
}
