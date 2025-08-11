import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getSessionById,
  createReview,
  getUserByAddress,
  updateUserRating,
  getReviews,
} from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: any
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { reviewerAddress, rating, comment } = body;

    if (!sessionId || !reviewerAddress || !rating) {
      return NextResponse.json(
        { error: "Session ID, reviewer address, and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    // Get session details
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "completed") {
      return NextResponse.json(
        { error: "Can only review completed sessions" },
        { status: 400 }
      );
    }

    // Get reviewer and target details
    let reviewer, target;

    if (session.tutorAddress && session.learnerAddress) {
      reviewer = await getUserByAddress(reviewerAddress);

      // Determine who is being reviewed
      if (reviewerAddress === session.tutorAddress) {
        // Tutor is reviewing learner
        target = await getUserByAddress(session.learnerAddress);
      } else if (reviewerAddress === session.learnerAddress) {
        // Learner is reviewing tutor
        target = await getUserByAddress(session.tutorAddress);
      } else {
        return NextResponse.json(
          { error: "Only session participants can leave reviews" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Session data incomplete" },
        { status: 400 }
      );
    }

    if (!reviewer || !target) {
      return NextResponse.json(
        { error: "Reviewer or target not found" },
        { status: 404 }
      );
    }

    // Check if review already exists
    const existingReviews = await getReviews({
      sessionId,
      reviewerId: reviewer.id,
    });
    if (existingReviews.length > 0) {
      return NextResponse.json(
        { error: "You have already reviewed this session" },
        { status: 400 }
      );
    }

    // Create review
    const newReview = await createReview({
      id: uuidv4(),
      sessionId,
      reviewerId: reviewer.id,
      targetId: target.id,
      rating,
      comment: comment || "",
    });

    // Update target user's rating
    await updateUserRating(target.address, rating);

    return NextResponse.json(
      {
        review: newReview,
        message: "Review submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}

// Get reviews for a session
export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const sessionId = params.id;

    const reviews = await getReviews({ sessionId });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
