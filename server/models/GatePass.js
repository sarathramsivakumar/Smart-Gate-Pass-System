import mongoose from "mongoose";

const gatePassSchema = new mongoose.Schema({
  studentName: String,
  reason: String,
  date: String,
  time: String,
  classHour: String,
  advisorStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  hodStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const GatePass = mongoose.model("GatePass", gatePassSchema);
export default GatePass;
