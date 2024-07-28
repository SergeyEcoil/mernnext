import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  phone: string;
  password: string;
  isActive: boolean;
  role: "user" | "admin";
  cities: string[];
}

const userSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isActive: { type: Boolean, default: false },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  cities: { type: [String], default: [] },
});

export default mongoose.model<IUser>("User", userSchema);
