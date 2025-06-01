import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  learner: string;
  teacher: string;
  topic: string;
  status: "pending" | "confirmed" | "completed";
  escrowId: string; 
  timestamp: Date;
}

const sessionSchema = new Schema<ISession>({
  learner: { type: String, required: true },
  teacher: { type: String, required: true },
  topic: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed"],
    default: "pending",
  },
  escrowId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Session ||
  mongoose.model<ISession>("Session", sessionSchema);
