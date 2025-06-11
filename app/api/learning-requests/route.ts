import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import {
  getLearningRequests,
  createLearningRequest,
  getUserByAddress,
} from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = parseInt(searchParams.get("skip") || "0");
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const skillName = searchParams.get("skillName");

    let filter: any = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;
    if (skillName) filter.skillName = { $regex: skillName, $options: "i" };

    const learningRequests = await getLearningRequests(filter, limit, skip);

    return NextResponse.json({ learningRequests });
  } catch (error: any) {
    console.error("Error fetching learning requests:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch learning requests" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userAddress,
      skillName,
      description,
      preferredDuration,
      maxBudget,
      preferredSchedule,
    } = body;

    if (
      !userAddress ||
      !skillName ||
      !description ||
      !preferredDuration ||
      !maxBudget
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate user exists
    const user = await getUserByAddress(userAddress);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create learning request
    const newLearningRequest = await createLearningRequest({
      id: uuidv4(),
      userId: user.id,
      skillName,
      description,
      preferredDuration,
      maxBudget,
      preferredSchedule: preferredSchedule || "Flexible",
      status: "open",
      bids: [],
    });

    return NextResponse.json(
      { learningRequest: newLearningRequest },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating learning request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create learning request" },
      { status: 500 }
    );
  }
}
