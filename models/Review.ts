import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  sessionId: string;
  reviewer: string;
  target: string;
  rating: number;
  feedback: string;
}

const reviewSchema = new Schema<IReview>({
  sessionId: { type: String, required: true },
  reviewer: { type: String, required: true },
  target: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feedback: { type: String },
});

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", reviewSchema);
