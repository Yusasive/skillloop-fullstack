import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  username: String,
  bio: String,
  tags: [String], 
  role: { type: String, enum: ["learner", "teacher", "both"], default: "both" },
});

export default mongoose.models.Profile ||
  mongoose.model("Profile", ProfileSchema);
