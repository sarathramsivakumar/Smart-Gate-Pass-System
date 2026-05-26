import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: { type: String, enum: ["student", "advisor", "hod"], default: "student" },
  studentId: String
});

const User = mongoose.model("User", userSchema);
export default User;
