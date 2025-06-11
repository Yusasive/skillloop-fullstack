import { MongoClient, ServerApiVersion } from "mongodb";
import {
  User,
  Session,
  Certificate,
  Review,
  TokenTransaction,
  Notification,
  LearningRequest,
  Bid,
} from "@/app/types";

// MongoDB connection string - should be stored in environment variables
const uri =
  process.env.MONGODB_URI ||
  "mongodb+srv://skillloop:skillloop123@cluster0.mongodb.net/skillloop?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Database collections
let db: any;
let users: any;
let sessions: any;
let certificates: any;
let reviews: any;
let transactions: any;
let notifications: any;
let learningRequests: any;
let isConnected = false;

async function connectToDatabase() {
  if (!isConnected) {
    try {
      await client.connect();
      db = client.db("skillloop");
      users = db.collection("users");
      sessions = db.collection("sessions");
      certificates = db.collection("certificates");
      reviews = db.collection("reviews");
      transactions = db.collection("transactions");
      notifications = db.collection("notifications");
      learningRequests = db.collection("learningRequests");

      // Create indexes
      await users.createIndex({ address: 1 }, { unique: true });
      await sessions.createIndex({ tutorId: 1, learnerId: 1 });
      await certificates.createIndex({ sessionId: 1 }, { unique: true });
      await reviews.createIndex({ sessionId: 1, reviewerId: 1 });
      await transactions.createIndex({ fromAddress: 1, toAddress: 1 });
      await notifications.createIndex({ userId: 1, createdAt: -1 });
      await learningRequests.createIndex({ userId: 1, status: 1 });

      isConnected = true;
      console.log("Connected to MongoDB successfully");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }
  return {
    db,
    users,
    sessions,
    certificates,
    reviews,
    transactions,
    notifications,
    learningRequests,
  };
}

export async function getUsers(
  filter = {},
  limit = 10,
  skip = 0
): Promise<User[]> {
  try {
    const { users } = await connectToDatabase();
    return users.find(filter).skip(skip).limit(limit).toArray();
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function getUserByAddress(address: string): Promise<User | null> {
  try {
    const { users } = await connectToDatabase();
    return users.findOne({ address: address.toLowerCase() });
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function createUser(user: Partial<User>): Promise<User> {
  try {
    const { users } = await connectToDatabase();
    const newUser = {
      ...user,
      address: user.address?.toLowerCase(),
      skills: user.skills || [],
      learning: user.learning || [],
      learningRequests: user.learningRequests || [],
      rating: 0,
      sessionsCompleted: 0,
      tokenBalance: 200, // Initial 200 SKL tokens for new users
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);
    return { ...newUser, _id: result.insertedId } as User;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function updateUser(
  address: string,
  updates: Partial<User>
): Promise<User | null> {
  try {
    const { users } = await connectToDatabase();

    const updateDoc = {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    };

    const result = await users.findOneAndUpdate(
      { address: address.toLowerCase() },
      updateDoc,
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

export async function updateUserTokenBalance(
  address: string,
  amount: number,
  operation: "add" | "subtract"
): Promise<User | null> {
  try {
    const { users } = await connectToDatabase();

    const updateDoc =
      operation === "add"
        ? { $inc: { tokenBalance: amount }, $set: { updatedAt: new Date() } }
        : { $inc: { tokenBalance: -amount }, $set: { updatedAt: new Date() } };

    const result = await users.findOneAndUpdate(
      { address: address.toLowerCase() },
      updateDoc,
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating user token balance:", error);
    throw error;
  }
}

export async function updateUserRating(
  address: string,
  newRating: number
): Promise<User | null> {
  try {
    const { users } = await connectToDatabase();

    // Get current user data
    const user = await users.findOne({ address: address.toLowerCase() });
    if (!user) return null;

    // Calculate new average rating
    const currentRating = user.rating || 0;
    const sessionsCompleted = user.sessionsCompleted || 0;
    const totalRatingPoints = currentRating * sessionsCompleted;
    const newTotalRatingPoints = totalRatingPoints + newRating;
    const newSessionsCompleted = sessionsCompleted + 1;
    const newAverageRating = newTotalRatingPoints / newSessionsCompleted;

    const result = await users.findOneAndUpdate(
      { address: address.toLowerCase() },
      {
        $set: {
          rating: Math.round(newAverageRating * 10) / 10, // Round to 1 decimal place
          sessionsCompleted: newSessionsCompleted,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating user rating:", error);
    throw error;
  }
}

export async function getSessions(
  filter = {},
  limit = 10,
  skip = 0
): Promise<Session[]> {
  try {
    const { sessions } = await connectToDatabase();
    return sessions
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

export async function getSessionById(id: string): Promise<Session | null> {
  try {
    const { sessions } = await connectToDatabase();
    return sessions.findOne({ id });
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
}

export async function createSession(
  session: Partial<Session>
): Promise<Session> {
  try {
    const { sessions } = await connectToDatabase();
    const newSession = {
      ...session,
      status: session.status || "requested",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await sessions.insertOne(newSession);
    return { ...newSession, _id: result.insertedId } as Session;
  } catch (error) {
    console.error("Error creating session:", error);
    throw error;
  }
}

export async function updateSession(
  id: string,
  updates: Partial<Session>
): Promise<Session | null> {
  try {
    const { sessions } = await connectToDatabase();

    const updateDoc = {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    };

    const result = await sessions.findOneAndUpdate({ id }, updateDoc, {
      returnDocument: "after",
    });

    return result;
  } catch (error) {
    console.error("Error updating session:", error);
    throw error;
  }
}

export async function getCertificates(
  filter = {},
  limit = 10,
  skip = 0
): Promise<Certificate[]> {
  try {
    const { certificates } = await connectToDatabase();
    return certificates
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return [];
  }
}

export async function createCertificate(
  certificate: Partial<Certificate>
): Promise<Certificate> {
  try {
    const { certificates } = await connectToDatabase();
    const newCertificate = {
      ...certificate,
      status: certificate.status || "pending",
      createdAt: new Date(),
    };

    const result = await certificates.insertOne(newCertificate);
    return { ...newCertificate, _id: result.insertedId } as Certificate;
  } catch (error) {
    console.error("Error creating certificate:", error);
    throw error;
  }
}

export async function updateCertificate(
  id: string,
  updates: Partial<Certificate>
): Promise<Certificate | null> {
  try {
    const { certificates } = await connectToDatabase();

    const result = await certificates.findOneAndUpdate(
      { id },
      { $set: updates },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating certificate:", error);
    throw error;
  }
}

export async function getReviews(
  filter = {},
  limit = 10,
  skip = 0
): Promise<Review[]> {
  try {
    const { reviews } = await connectToDatabase();
    return reviews
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

export async function createReview(review: Partial<Review>): Promise<Review> {
  try {
    const { reviews } = await connectToDatabase();
    const newReview = {
      ...review,
      createdAt: new Date(),
    };

    const result = await reviews.insertOne(newReview);
    return { ...newReview, _id: result.insertedId } as Review;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
}

export async function createTokenTransaction(
  transaction: Partial<TokenTransaction>
): Promise<TokenTransaction> {
  try {
    const { transactions } = await connectToDatabase();
    const newTransaction = {
      ...transaction,
      status: transaction.status || "pending",
      createdAt: new Date(),
    };

    const result = await transactions.insertOne(newTransaction);
    return { ...newTransaction, _id: result.insertedId } as TokenTransaction;
  } catch (error) {
    console.error("Error creating token transaction:", error);
    throw error;
  }
}

export async function updateTokenTransaction(
  sessionId: string,
  updates: Partial<TokenTransaction>
): Promise<TokenTransaction | null> {
  try {
    const { transactions } = await connectToDatabase();

    const result = await transactions.findOneAndUpdate(
      { sessionId },
      { $set: updates },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating token transaction:", error);
    throw error;
  }
}

export async function getNotifications(
  filter = {},
  limit = 10,
  skip = 0
): Promise<Notification[]> {
  try {
    const { notifications } = await connectToDatabase();
    return notifications
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
}

export async function createNotification(
  notification: Partial<Notification>
): Promise<Notification> {
  try {
    const { notifications } = await connectToDatabase();
    const newNotification = {
      ...notification,
      read: false,
      createdAt: new Date(),
    };

    const result = await notifications.insertOne(newNotification);
    return { ...newNotification, _id: result.insertedId } as Notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function markNotificationAsRead(
  id: string
): Promise<Notification | null> {
  try {
    const { notifications } = await connectToDatabase();

    const result = await notifications.findOneAndUpdate(
      { id },
      { $set: { read: true } },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
}

// Learning Request functions
export async function getLearningRequests(
  filter = {},
  limit = 10,
  skip = 0
): Promise<LearningRequest[]> {
  try {
    const { learningRequests } = await connectToDatabase();
    return learningRequests
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
  } catch (error) {
    console.error("Error fetching learning requests:", error);
    return [];
  }
}

export async function getLearningRequestById(
  id: string
): Promise<LearningRequest | null> {
  try {
    const { learningRequests } = await connectToDatabase();
    return learningRequests.findOne({ id });
  } catch (error) {
    console.error("Error fetching learning request:", error);
    return null;
  }
}

export async function createLearningRequest(
  learningRequest: Partial<LearningRequest>
): Promise<LearningRequest> {
  try {
    const { learningRequests } = await connectToDatabase();
    const newLearningRequest = {
      ...learningRequest,
      status: learningRequest.status || "open",
      bids: learningRequest.bids || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await learningRequests.insertOne(newLearningRequest);
    return { ...newLearningRequest, _id: result.insertedId } as LearningRequest;
  } catch (error) {
    console.error("Error creating learning request:", error);
    throw error;
  }
}

export async function addBidToLearningRequest(
  learningRequestId: string,
  bid: Bid
): Promise<LearningRequest | null> {
  try {
    const { learningRequests } = await connectToDatabase();

    const result = await learningRequests.findOneAndUpdate(
      { id: learningRequestId },
      {
        $push: { bids: bid },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error adding bid to learning request:", error);
    throw error;
  }
}

export async function updateBidStatus(
  learningRequestId: string,
  bidId: string,
  status: string
): Promise<LearningRequest | null> {
  try {
    const { learningRequests } = await connectToDatabase();

    const result = await learningRequests.findOneAndUpdate(
      { id: learningRequestId, "bids.id": bidId },
      {
        $set: {
          "bids.$.status": status,
          "bids.$.updatedAt": new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating bid status:", error);
    throw error;
  }
}

export async function updateLearningRequestStatus(
  learningRequestId: string,
  status: string,
  selectedBidId?: string
): Promise<LearningRequest | null> {
  try {
    const { learningRequests } = await connectToDatabase();

    const updateDoc: any = {
      $set: {
        status,
        updatedAt: new Date(),
      },
    };

    if (selectedBidId) {
      updateDoc.$set.selectedBidId = selectedBidId;
    }

    const result = await learningRequests.findOneAndUpdate(
      { id: learningRequestId },
      updateDoc,
      { returnDocument: "after" }
    );

    return result;
  } catch (error) {
    console.error("Error updating learning request status:", error);
    throw error;
  }
}

// Close MongoDB connection when the app is shutting down
process.on("SIGINT", async () => {
  if (isConnected) {
    await client.close();
    isConnected = false;
  }
  process.exit(0);
});

export { connectToDatabase };
