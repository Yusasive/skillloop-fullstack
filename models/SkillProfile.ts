import mongoose, { Schema, Document } from "mongoose";

export interface ISkillProfile extends Document {
  wallet: string;
  skillsToLearn: string[];
  skillsToTeach: string[];
}

const skillProfileSchema = new Schema<ISkillProfile>({
  wallet: { type: String, unique: true, required: true },
  skillsToLearn: { type: [String], default: [] },
  skillsToTeach: { type: [String], default: [] },
});

export default mongoose.models.SkillProfile ||
  mongoose.model<ISkillProfile>("SkillProfile", skillProfileSchema);
