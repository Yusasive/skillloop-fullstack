import { NextRequest, NextResponse } from "next/server";
import {
  getSessionById,
  updateSession,
  getUserByAddress,
  createNotification,
} from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

// Start session and initialize progress tracking
export async function POST(
  req: NextRequest,
  { params }: any
) {
  try {
    const sessionId = params.id;
    const body = await req.json();
    const { action, userAddress, meetingData, milestoneUpdate, sessionNotes } =
      body;

    if (!sessionId || !userAddress || !action) {
      return NextResponse.json(
        { error: "Session ID, user address, and action are required" },
        { status: 400 }
      );
    }

    // Get session details
    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get user details
    const user = await getUserByAddress(userAddress);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify user is part of the session
    if (
      session.tutorAddress !== userAddress &&
      session.learnerAddress !== userAddress
    ) {
      return NextResponse.json(
        { error: "Only session participants can update progress" },
        { status: 403 }
      );
    }

    const isTutor = session.tutorAddress === userAddress;

    switch (action) {
      case "start_session":
        if (!isTutor) {
          return NextResponse.json(
            { error: "Only tutors can start sessions" },
            { status: 403 }
          );
        }

        if (session.status !== "confirmed") {
          return NextResponse.json(
            { error: "Session must be confirmed before starting" },
            { status: 400 }
          );
        }

        // Initialize progress tracking
        const initialMilestones = generateMilestones(
          session.skillName,
          session.duration
        );
        const progressTracking = {
          milestones: initialMilestones,
          overallProgress: 0,
          timeSpent: 0,
          attendanceVerified: false,
          learnerEngagement: 0,
          objectivesAchieved: [],
          canComplete: false,
        };

        const updatedSession = await updateSession(sessionId, {
          status: "in-progress",
          actualStartTime: new Date(),
          progressTracking,
          learningObjectives: generateLearningObjectives(session.skillName),
          sessionNotes: "",
        });

        // Notify learner that session has started
        const learner = await getUserByAddress(session.learnerAddress!);
        if (learner) {
          await createNotification({
            id: uuidv4(),
            userId: learner.id,
            type: "session_started",
            title: "Session Started!",
            message: `Your ${session.skillName} session has begun. Join the meeting to start learning!`,
            data: { sessionId, meetingLink: session.meetingLink },
            read: false,
          });
        }

        return NextResponse.json({
          session: updatedSession,
          message: "Session started successfully!",
        });

      case "update_milestone":
        if (!isTutor) {
          return NextResponse.json(
            { error: "Only tutors can update milestones" },
            { status: 403 }
          );
        }

        if (!milestoneUpdate || !milestoneUpdate.milestoneId) {
          return NextResponse.json(
            { error: "Milestone update data is required" },
            { status: 400 }
          );
        }

        const currentProgress = session.progressTracking || {
          milestones: [],
          overallProgress: 0,
          timeSpent: 0,
          attendanceVerified: false,
          learnerEngagement: 0,
          objectivesAchieved: [],
          canComplete: false,
        };

        // Update specific milestone
        const updatedMilestones = currentProgress.milestones.map(
          (milestone) => {
            if (milestone.id === milestoneUpdate.milestoneId) {
              return {
                ...milestone,
                completed: milestoneUpdate.completed,
                completedAt: milestoneUpdate.completed ? new Date() : undefined,
                notes: milestoneUpdate.notes || milestone.notes,
              };
            }
            return milestone;
          }
        );

        // Calculate overall progress
        const completedMilestones = updatedMilestones.filter(
          (m) => m.completed
        ).length;
        const overallProgress = Math.round(
          (completedMilestones / updatedMilestones.length) * 100
        );

        // Update session with new progress
        const progressUpdate = {
          ...currentProgress,
          milestones: updatedMilestones,
          overallProgress,
          canComplete: overallProgress >= 70, // Can complete if 70% or more progress
        };

        const sessionWithProgress = await updateSession(sessionId, {
          progressTracking: progressUpdate,
        });

        return NextResponse.json({
          session: sessionWithProgress,
          message: `Milestone updated! Progress: ${overallProgress}%`,
        });

      case "update_meeting_data":
        if (!meetingData) {
          return NextResponse.json(
            { error: "Meeting data is required" },
            { status: 400 }
          );
        }

        // Verify attendance (both participants should have joined)
        const attendanceVerified =
          meetingData.participants.length >= 2 &&
          meetingData.attendanceRate >= 80; // 80% attendance required

        const currentProgressForMeeting = session.progressTracking || {
          milestones: [],
          overallProgress: 0,
          timeSpent: meetingData.duration,
          attendanceVerified: false,
          learnerEngagement: 0,
          objectivesAchieved: [],
          canComplete: false,
        };

        const meetingProgressUpdate = {
          ...currentProgressForMeeting,
          timeSpent: meetingData.duration,
          attendanceVerified,
          meetingRecordingUrl: meetingData.recordingUrl,
        };

        const sessionWithMeetingData = await updateSession(sessionId, {
          progressTracking: meetingProgressUpdate,
        });

        return NextResponse.json({
          session: sessionWithMeetingData,
          message: "Meeting data updated successfully!",
        });

      case "add_session_notes":
        if (!isTutor) {
          return NextResponse.json(
            { error: "Only tutors can add session notes" },
            { status: 403 }
          );
        }

        const notesUpdate = await updateSession(sessionId, {
          sessionNotes: sessionNotes || "",
        });

        return NextResponse.json({
          session: notesUpdate,
          message: "Session notes updated!",
        });

      case "end_session":
        if (!isTutor) {
          return NextResponse.json(
            { error: "Only tutors can end sessions" },
            { status: 403 }
          );
        }

        const endedSession = await updateSession(sessionId, {
          actualEndTime: new Date(),
        });

        return NextResponse.json({
          session: endedSession,
          message:
            "Session ended. You can now mark it as complete if progress is sufficient.",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Error updating session progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update session progress" },
      { status: 500 }
    );
  }
}

// Get session progress
export async function GET(
  req: NextRequest,
  { params }: any
) {
  try {
    const sessionId = params.id;

    const session = await getSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      progress: session.progressTracking || null,
      learningObjectives: session.learningObjectives || [],
      sessionNotes: session.sessionNotes || "",
      actualStartTime: session.actualStartTime,
      actualEndTime: session.actualEndTime,
    });
  } catch (error: any) {
    console.error("Error fetching session progress:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch session progress" },
      { status: 500 }
    );
  }
}

// Helper function to generate milestones based on skill and duration
function generateMilestones(skillName: string, duration: number) {
  const baseMilestones = [
    {
      id: uuidv4(),
      title: "Session Introduction",
      description: "Introductions, goal setting, and agenda overview",
      targetTime: 5,
      completed: false,
    },
    {
      id: uuidv4(),
      title: "Core Concept Explanation",
      description: `Understanding fundamental concepts of ${skillName}`,
      targetTime: Math.floor(duration * 0.3),
      completed: false,
    },
    {
      id: uuidv4(),
      title: "Hands-on Practice",
      description: "Practical exercises and real-world application",
      targetTime: Math.floor(duration * 0.6),
      completed: false,
    },
    {
      id: uuidv4(),
      title: "Q&A and Clarification",
      description: "Questions, doubts clarification, and additional examples",
      targetTime: Math.floor(duration * 0.8),
      completed: false,
    },
    {
      id: uuidv4(),
      title: "Session Summary",
      description: "Key takeaways, next steps, and resource recommendations",
      targetTime: duration - 5,
      completed: false,
    },
  ];

  return baseMilestones;
}

// Helper function to generate learning objectives
function generateLearningObjectives(skillName: string) {
  const objectiveTemplates = {
    Solidity: [
      "Understand smart contract basics and structure",
      "Write and deploy a simple smart contract",
      "Implement basic functions and state variables",
      "Understand gas optimization principles",
    ],
    React: [
      "Understand component lifecycle and hooks",
      "Build interactive user interfaces",
      "Manage state effectively",
      "Implement proper event handling",
    ],
    DeFi: [
      "Understand decentralized finance protocols",
      "Learn about liquidity pools and yield farming",
      "Explore lending and borrowing mechanisms",
      "Understand tokenomics and governance",
    ],
    Web3: [
      "Connect to blockchain networks",
      "Interact with smart contracts",
      "Implement wallet integration",
      "Understand decentralized applications",
    ],
  };

  // Find matching objectives or use generic ones
  for (const [key, objectives] of Object.entries(objectiveTemplates)) {
    if (skillName.toLowerCase().includes(key.toLowerCase())) {
      return objectives;
    }
  }

  // Generic objectives
  return [
    `Understand core concepts of ${skillName}`,
    `Apply practical knowledge through exercises`,
    `Identify common patterns and best practices`,
    `Plan next steps for continued learning`,
  ];
}
