import mongoose from "mongoose";

const SessionLogSchema = new mongoose.Schema({
  wallet: String,
  action: String, 
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.SessionLog ||
  mongoose.model("SessionLog", SessionLogSchema);
