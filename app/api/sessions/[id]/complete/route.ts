import { NextRequest, NextResponse } from "next/server";
import {
  getSessionById,
  updateSession,
  getUserByAddress,
  updateUserTokenBalance,
  updateTokenTransaction,
  createCertificate,
  createNotification,
} from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { completedBy, finalNotes, learnerEngagement } = body; // Address of tutor confirming completion

    if (!sessionId || !completedBy) {
      return NextResponse.json(
        { error: "Session ID and completedBy address are required" },
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
        { error: "Session already completed" },
        { status: 400 }
      );
    }

    if (session.status !== "in-progress") {
      return NextResponse.json(
        { error: "Session must be in progress before completion" },
        { status: 400 }
      );
    }

    // Get tutor and learner details using addresses
    let tutor, learner;

    if (session.tutorAddress && session.learnerAddress) {
      tutor = await getUserByAddress(session.tutorAddress);
      learner = await getUserByAddress(session.learnerAddress);
    } else {
      return NextResponse.json(
        { error: "Session data incomplete - missing participant addresses" },
        { status: 400 }
      );
    }

    if (!tutor || !learner) {
      return NextResponse.json(
        { error: "Tutor or learner not found" },
        { status: 404 }
      );
    }

    // IMPORTANT: Only tutor can mark session as complete
    if (completedBy !== tutor.address) {
      return NextResponse.json(
        { error: "Only the tutor can mark the session as completed" },
        { status: 403 }
      );
    }

    // Check progress requirements (70% minimum)
    const progressTracking = session.progressTracking;
    if (!progressTracking) {
      return NextResponse.json(
        {
          error:
            "Session progress tracking not found. Please start the session first.",
        },
        { status: 400 }
      );
    }

    if (progressTracking.overallProgress < 70) {
      return NextResponse.json(
        {
          error: `Session cannot be completed. Progress is ${progressTracking.overallProgress}% but minimum 70% is required.`,
        },
        { status: 400 }
      );
    }

    // Verify attendance was confirmed
    if (!progressTracking.attendanceVerified) {
      return NextResponse.json(
        {
          error:
            "Session cannot be completed. Attendance verification is required.",
        },
        { status: 400 }
      );
    }

    // Check minimum time spent (at least 70% of scheduled duration)
    const minimumTimeRequired = Math.floor(session.duration * 0.7);
    if (progressTracking.timeSpent < minimumTimeRequired) {
      return NextResponse.json(
        {
          error: `Session cannot be completed. Minimum ${minimumTimeRequired} minutes required, but only ${progressTracking.timeSpent} minutes spent.`,
        },
        { status: 400 }
      );
    }

    // Update final progress data
    const finalProgressTracking = {
      ...progressTracking,
      learnerEngagement:
        learnerEngagement || progressTracking.learnerEngagement,
      nextSteps: finalNotes || progressTracking.nextSteps,
    };

    // Mark session as completed
    const updatedSession = await updateSession(sessionId, {
      status: "completed",
      actualEndTime: new Date(),
      progressTracking: finalProgressTracking,
      sessionNotes:
        (session.sessionNotes || "") +
        (finalNotes ? `\n\nFinal Notes: ${finalNotes}` : ""),
    });

    // Release tokens to tutor
    await updateUserTokenBalance(tutor.address, session.tokenAmount, "add");

    // Update token transaction status
    await updateTokenTransaction(sessionId, {
      status: "completed",
    });

    // Automatically generate enhanced certificate for the learner
    const certificateId = uuidv4();
    const certificate = await createCertificate({
      id: certificateId,
      sessionId: sessionId,
      recipientId: learner.id,
      issuerId: tutor.id,
      skillName: session.skillName,
      status: "pending",
      progressAchieved: finalProgressTracking.overallProgress,
      objectivesCompleted: finalProgressTracking.objectivesAchieved,
      sessionDuration: finalProgressTracking.timeSpent,
      tutorNotes: finalNotes,
    });

    // Create notifications for both participants
    await createNotification({
      id: uuidv4(),
      userId: tutor.id,
      type: "session_completed",
      title: "Session Completed!",
      message: `Your ${session.skillName} session with ${learner.username || "your student"} is complete. ${session.tokenAmount} SKL tokens have been released to you. Progress achieved: ${finalProgressTracking.overallProgress}%`,
      data: {
        sessionId,
        learnerName: learner.username,
        skillName: session.skillName,
        tokenAmount: session.tokenAmount,
        progressAchieved: finalProgressTracking.overallProgress,
      },
      read: false,
    });

    await createNotification({
      id: uuidv4(),
      userId: learner.id,
      type: "certificate_issued",
      title: "Certificate Earned!",
      message: `Congratulations! You've completed ${session.skillName} with ${finalProgressTracking.overallProgress}% progress. Your certificate is ready to mint as an NFT!`,
      data: {
        sessionId,
        certificateId,
        tutorName: tutor.username,
        skillName: session.skillName,
        progressAchieved: finalProgressTracking.overallProgress,
      },
      read: false,
    });

    return NextResponse.json({
      session: updatedSession,
      certificate: certificate,
      message: `Session completed with ${finalProgressTracking.overallProgress}% progress! ${session.tokenAmount} SKL tokens released. Certificate generated for the student!`,
    });
  } catch (error: any) {
    console.error("Error completing session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to complete session" },
      { status: 500 }
    );
  }
}
