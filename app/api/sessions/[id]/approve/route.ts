import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getSessionById,
  updateSession,
  getUserByAddress,
  createNotification,
} from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { approvedBy, meetingLink } = body; // Address of tutor approving

    if (!sessionId || !approvedBy) {
      return NextResponse.json(
        { error: "Session ID and approvedBy address are required" },
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

    // Verify that the person approving is the tutor
    if (approvedBy !== tutor.address) {
      return NextResponse.json(
        { error: "Only the assigned tutor can approve this session" },
        { status: 403 }
      );
    }

    // Update session status to confirmed
    const updatedSession = await updateSession(sessionId, {
      status: "confirmed",
      meetingLink: meetingLink || undefined,
    });

    // Create notification for learner
    await createNotification({
      id: uuidv4(),
      userId: learner.id,
      type: "session_approved",
      title: "Session Approved!",
      message: `Your ${session.skillName} session with ${tutor.username || "your tutor"} has been approved`,
      data: {
        sessionId,
        tutorName: tutor.username,
        skillName: session.skillName,
        meetingLink,
      },
      read: false,
    });

    return NextResponse.json({
      session: updatedSession,
      message: "Session approved successfully!",
    });
  } catch (error: any) {
    console.error("Error approving session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to approve session" },
      { status: 500 }
    );
  }
}