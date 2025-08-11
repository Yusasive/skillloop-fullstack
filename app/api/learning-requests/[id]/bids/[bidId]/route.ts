import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getLearningRequestById,
  updateBidStatus,
  updateLearningRequestStatus,
  getUserByAddress,
  createSession,
  updateUserTokenBalance,
  createTokenTransaction,
  createNotification,
} from "@/lib/db";

export async function PUT(
  req: NextRequest,
  { params }: any
) {
  try {
    const { id: learningRequestId, bidId } = params;
    const body = await req.json();
    const { action, userAddress, sessionDate, sessionTime } = body; // action: 'accept' | 'reject'

    if (!action || !userAddress) {
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

    // Find the bid
    const bid = learningRequest.bids.find((b) => b.id === bidId);
    if (!bid) {
      return NextResponse.json({ error: "Bid not found" }, { status: 404 });
    }

    if (bid.status !== "pending") {
      return NextResponse.json(
        { error: "Bid is no longer pending" },
        { status: 400 }
      );
    }

    // Verify user is the learning request owner
    const user = await getUserByAddress(userAddress);
    if (!user || user.id !== learningRequest.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get tutor details
    const tutor = await getUserByAddress(bid.tutorAddress);
    if (!tutor) {
      return NextResponse.json({ error: "Tutor not found" }, { status: 404 });
    }

    if (action === "accept") {
      if (!sessionDate || !sessionTime) {
        return NextResponse.json(
          { error: "Session date and time are required for acceptance" },
          { status: 400 }
        );
      }

      // Check if learner has sufficient balance
      if (user.tokenBalance < bid.totalCost) {
        return NextResponse.json(
          {
            error: `Insufficient SKL tokens. You have ${user.tokenBalance} SKL but need ${bid.totalCost} SKL`,
          },
          { status: 400 }
        );
      }

      // Create session date/time
      const startDateTime = new Date(`${sessionDate}T${sessionTime}`);
      const endDateTime = new Date(
        startDateTime.getTime() + bid.proposedDuration * 60000
      );

      // Deduct tokens from learner's account (escrow)
      await updateUserTokenBalance(userAddress, bid.totalCost, "subtract");

      // Create session
      const sessionId = uuidv4();
      const newSession = await createSession({
        id: sessionId,
        tutorId: tutor.id,
        learnerId: user.id,
        tutorAddress: bid.tutorAddress,
        learnerAddress: userAddress,
        skillName: learningRequest.skillName,
        startTime: startDateTime,
        endTime: endDateTime,
        duration: bid.proposedDuration,
        tokenAmount: bid.totalCost,
        description: learningRequest.description,
        status: "confirmed", // Auto-confirmed since bid was accepted
        bidId: bidId,
      });

      // Create token transaction record
      await createTokenTransaction({
        id: uuidv4(),
        fromAddress: userAddress,
        toAddress: bid.tutorAddress,
        amount: bid.totalCost,
        type: "booking",
        sessionId: sessionId,
        status: "pending",
      });

      // Update bid status
      await updateBidStatus(learningRequestId, bidId, "accepted");

      // Close learning request
      await updateLearningRequestStatus(
        learningRequestId,
        "in_progress",
        bidId
      );

      // Reject all other pending bids
      for (const otherBid of learningRequest.bids) {
        if (otherBid.id !== bidId && otherBid.status === "pending") {
          await updateBidStatus(learningRequestId, otherBid.id, "rejected");

          // Notify other tutors
          const otherTutor = await getUserByAddress(otherBid.tutorAddress);
          if (otherTutor) {
            await createNotification({
              id: uuidv4(),
              userId: otherTutor.id,
              type: "bid_rejected",
              title: "Bid Not Selected",
              message: `Your bid for ${learningRequest.skillName} was not selected. The student chose another tutor.`,
              data: {
                learningRequestId,
                bidId: otherBid.id,
                skillName: learningRequest.skillName,
              },
              read: false,
            });
          }
        }
      }

      // Create notification for accepted tutor
      await createNotification({
        id: uuidv4(),
        userId: tutor.id,
        type: "bid_accepted",
        title: "Bid Accepted!",
        message: `Your bid for ${learningRequest.skillName} has been accepted! Session scheduled for ${startDateTime.toLocaleDateString()}.`,
        data: {
          learningRequestId,
          bidId,
          sessionId,
          skillName: learningRequest.skillName,
          sessionDate: startDateTime.toISOString(),
        },
        read: false,
      });

      return NextResponse.json({
        session: newSession,
        message: `Bid accepted! Session scheduled and ${bid.totalCost} SKL tokens have been held in escrow.`,
      });
    } else if (action === "reject") {
      // Update bid status
      await updateBidStatus(learningRequestId, bidId, "rejected");

      // Create notification for tutor
      await createNotification({
        id: uuidv4(),
        userId: tutor.id,
        type: "bid_rejected",
        title: "Bid Rejected",
        message: `Your bid for ${learningRequest.skillName} has been rejected by the student.`,
        data: {
          learningRequestId,
          bidId,
          skillName: learningRequest.skillName,
        },
        read: false,
      });

      return NextResponse.json({
        message: "Bid rejected successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Error updating bid:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update bid" },
      { status: 500 }
    );
  }
}
