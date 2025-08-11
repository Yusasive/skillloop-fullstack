import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getSessionById,
  updateSession,
  getUserByAddress,
  updateUserTokenBalance,
  updateTokenTransaction,
  createNotification,
} from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: any
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { rejectedBy, reason } = body; // Address of tutor rejecting and reason

    if (!sessionId || !rejectedBy || !reason) {
      return NextResponse.json(
        { error: "Session ID, rejectedBy address, and reason are required" },
        { status: 400 }
      );
    }

    // Get session details
    const session = await getSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "requested") {
      return NextResponse.json(
        { error: "Session is not in requested status" },
        { status: 400 }
      );
    }

    // Get tutor and learner details
    let tutor, learner;

    if (session.tutorAddress && session.learnerAddress) {
      tutor = await getUserByAddress(session.tutorAddress);
      learner = await getUserByAddress(session.learnerAddress);
    } else {
      tutor = await getUserByAddress(session.tutorId);
      learner = await getUserByAddress(session.learnerId);
    }

    if (!tutor || !learner) {
      return NextResponse.json(
        { error: "Tutor or learner not found" },
        { status: 404 }
      );
    }

    // Verify that the person rejecting is the tutor
    if (rejectedBy !== tutor.address) {
      return NextResponse.json(
        { error: "Only the assigned tutor can reject this session" },
        { status: 403 }
      );
    }

    // Update session status to rejected
    const updatedSession = await updateSession(sessionId, {
      status: "rejected",
      rejectionReason: reason,
    });

    // Refund tokens to learner
    await updateUserTokenBalance(learner.address, session.tokenAmount, "add");

    // Update token transaction status
    await updateTokenTransaction(sessionId, {
      status: "failed",
    });

    // Create notification for learner
    await createNotification({
      id: uuidv4(),
      userId: learner.id,
      type: "session_rejected",
      title: "Session Request Declined",
      message: `Your ${session.skillName} session request was declined. Tokens have been refunded.`,
      data: {
        sessionId,
        tutorName: tutor.username,
        skillName: session.skillName,
        reason,
      },
      read: false,
    });

    return NextResponse.json({
      session: updatedSession,
      message: `Session rejected. ${session.tokenAmount} SKL tokens have been refunded to the learner.`,
    });
  } catch (error: any) {
    console.error("Error rejecting session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reject session" },
      { status: 500 }
    );
  }
}