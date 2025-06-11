// User related types
export interface User {
  id: string;
  address: string;
  username: string | null;
  bio: string | null;
  avatar: string | null;
  skills: Skill[];
  learning: string[];
  learningRequests: LearningRequest[]; // New field for learning requests
  rating: number;
  sessionsCompleted: number;
  tokenBalance: number; // SKL token balance
  createdAt: Date;
  updatedAt: Date;
}

export interface Skill {
  name: string;
  level: "beginner" | "intermediate" | "expert";
  description: string;
  hourlyRate?: number; // SKL tokens per hour (5-20 range)
}

// New Learning Request type
export interface LearningRequest {
  id: string;
  userId: string;
  skillName: string;
  description: string;
  preferredDuration: number; // in minutes
  maxBudget: number; // maximum SKL tokens willing to pay
  preferredSchedule: string; // e.g., "Weekends", "Evenings", "Flexible"
  status: "open" | "closed" | "in_progress";
  bids: Bid[];
  selectedBidId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// New Bid type
export interface Bid {
  id: string;
  learningRequestId: string;
  tutorId: string;
  tutorAddress: string;
  proposedRate: number; // SKL tokens per hour
  proposedDuration: number; // in minutes
  totalCost: number; // calculated cost
  message: string; // tutor's pitch
  availableSlots: string[]; // proposed time slots
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: Date;
  updatedAt: Date;
}

// Session related types with progress tracking
export interface Session {
  id: string;
  tutorId: string;
  learnerId: string;
  tutorAddress?: string; // Store addresses for easier lookup
  learnerAddress?: string;
  skillName: string;
  status:
    | "requested"
    | "confirmed"
    | "rejected"
    | "in-progress"
    | "completed"
    | "canceled";
  startTime: Date;
  endTime: Date;
  duration: number;
  tokenAmount: number; // SKL tokens
  description: string;
  meetingLink?: string;
  txHash?: string;
  escrowId?: string; // Reference to blockchain escrow
  rejectionReason?: string; // Reason for rejection by tutor
  cancellationReason?: string; // Reason for cancellation by either party
  canceledBy?: string; // Address of who canceled
  bidId?: string; // Reference to the bid if session came from bidding

  // New Progress Tracking Fields
  progressTracking?: SessionProgress;
  learningObjectives?: string[]; // Set during session confirmation
  actualStartTime?: Date; // When session actually started
  actualEndTime?: Date; // When session actually ended
  sessionNotes?: string; // Tutor's notes about the session

  createdAt: Date;
  updatedAt: Date;
}

// New Progress Tracking Interface
export interface SessionProgress {
  milestones: Milestone[];
  overallProgress: number; // 0-100 percentage
  timeSpent: number; // actual minutes spent in session
  meetingRecordingUrl?: string; // Google Meet recording URL
  attendanceVerified: boolean; // Both parties attended
  learnerEngagement: number; // 1-5 rating by tutor
  objectivesAchieved: string[]; // Which objectives were completed
  nextSteps?: string; // Recommendations for next session
  canComplete: boolean; // Whether session can be marked complete (70%+ progress)
}

// Individual Milestone Interface
export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetTime: number; // minutes from session start
  completed: boolean;
  completedAt?: Date;
  notes?: string;
}

// Google Meet Integration Interface
export interface MeetingData {
  meetingId: string;
  meetingUrl: string;
  startTime: Date;
  endTime?: Date;
  participants: MeetingParticipant[];
  recordingUrl?: string;
  duration: number; // actual meeting duration in minutes
  attendanceRate: number; // percentage of session time both were present
}

export interface MeetingParticipant {
  email: string;
  name: string;
  joinTime: Date;
  leaveTime?: Date;
  totalDuration: number; // minutes in meeting
}

// Certificate related types
export interface Certificate {
  id: string;
  sessionId: string;
  recipientId: string; // Database ID of the recipient (learner)
  issuerId: string; // Database ID of the issuer (tutor)
  skillName: string;
  tokenId?: string;
  txHash?: string;
  metadataUri?: string;
  status: "pending" | "minted" | "failed";

  // Enhanced Certificate Data
  progressAchieved: number; // Final progress percentage
  objectivesCompleted: string[]; // Learning objectives achieved
  sessionDuration: number; // Actual session duration
  tutorNotes?: string; // Final notes from tutor

  createdAt: Date;
}

// Review related types
export interface Review {
  id: string;
  sessionId: string;
  reviewerId: string;
  targetId: string;
  rating: number;
  comment: string;

  // Enhanced Review Data
  progressRating?: number; // How well objectives were met (1-5)
  teachingQuality?: number; // Quality of instruction (1-5)
  engagement?: number; // Student engagement level (1-5)

  createdAt: Date;
}

// Blockchain related types
export interface EscrowData {
  sessionId: string;
  tutor: string;
  learner: string;
  amount: number; // SKL tokens
  startTime: number;
  endTime: number;
  completed: boolean;
  canceled: boolean;
}

// Token transaction types
export interface TokenTransaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  type: "booking" | "completion" | "refund" | "initial_mint";
  sessionId?: string;
  txHash?: string;
  status: "pending" | "completed" | "failed";
  createdAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type:
    | "session_request"
    | "session_approved"
    | "session_rejected"
    | "session_completed"
    | "session_canceled"
    | "certificate_issued"
    | "new_bid"
    | "bid_accepted"
    | "bid_rejected"
    | "learning_request_created"
    | "session_started"
    | "milestone_completed"
    | "progress_update";
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}
