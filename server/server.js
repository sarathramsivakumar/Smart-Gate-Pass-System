// ================== Class2Gate Full Backend ==================
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// ================== 🔹 MongoDB Connection ==================
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/class2gate";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Failed:", err));

// ================== 🔹 User Schema ==================
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["student", "advisor", "hod", "admin", "security"],
    default: "student",
  },
});
const User = mongoose.model("User", userSchema);

// ================== 🔹 GatePass Schema ==================
const gatePassSchema = new mongoose.Schema({
  studentName: String,
  reason: String,
  date: String,
  time: String,
  classHour: String,
  advisorStatus: { type: String, default: "pending" },
  hodStatus: { type: String, default: "pending" },
});
const GatePass = mongoose.model("GatePass", gatePassSchema);

// ================== 🔹 Security Log Schema ==================
const securityLogSchema = new mongoose.Schema({
  studentName: String,
  date: String,
  time: String,
  qrCodeId: String, // GatePass ID
  status: { type: String, default: "Exited" },
});
const SecurityLog = mongoose.model("SecurityLog", securityLogSchema);

// ================== 🔹 Login ==================
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (!user) return res.json({ ok: false, error: "Invalid email or password" });

  res.json({
    ok: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// ================== 🔹 Student: Create GatePass ==================
app.post("/api/gatepass", async (req, res) => {
  try {
    const { studentName, reason, date, time, classHour } = req.body;
    if (!studentName || !reason || !date || !time || !classHour)
      return res.json({ ok: false, error: "All fields required" });

    const newPass = new GatePass({ studentName, reason, date, time, classHour });
    await newPass.save();
    res.json({ ok: true, message: "✅ Gate Pass Created Successfully" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ================== 🔹 Advisor/HOD: View Requests ==================
app.get("/api/gatepass", async (req, res) => {
  try {
    const requests = await GatePass.find().sort({ _id: -1 });
    res.json({ ok: true, requests });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ================== 🔹 Advisor/HOD: Update Status ==================
app.put("/api/gatepass/:id", async (req, res) => {
  try {
    const { role, status } = req.body;
    const updateField = role === "advisor" ? { advisorStatus: status } : { hodStatus: status };

    await GatePass.findByIdAndUpdate(req.params.id, updateField);
    res.json({ ok: true, message: "Status updated successfully" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ================== 🔹 Admin: Manage Users & Passes ==================
app.get("/api/admin/users", async (req, res) => {
  try {
    const users = await User.find().sort({ role: 1, name: 1 });
    res.json({ ok: true, users });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.post("/api/admin/users", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.json({ ok: false, error: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing) return res.json({ ok: false, error: "User already exists" });

    const newUser = new User({ name, email, password, role });
    await newUser.save();
    res.json({ ok: true, message: "✅ User Added Successfully" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ ok: true, message: "✅ User Deleted Successfully" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.get("/api/admin/gatepasses", async (req, res) => {
  try {
    const passes = await GatePass.find().sort({ _id: -1 });
    res.json({ ok: true, passes });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ================== 🔹 Security: QR Scan & Logs ==================
app.post("/api/security/scan", async (req, res) => {
  try {
    const { qrCodeId } = req.body;
    const gatePass = await GatePass.findById(qrCodeId);
    if (!gatePass) return res.json({ ok: false, error: "Invalid QR code" });

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    const newLog = new SecurityLog({
      studentName: gatePass.studentName,
      date,
      time,
      qrCodeId,
      status: "Exited",
    });
    await newLog.save();
    res.json({ ok: true, message: "✅ Exit recorded successfully" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

app.get("/api/security/logs", async (req, res) => {
  try {
    const logs = await SecurityLog.find().sort({ _id: -1 });
    res.json({ ok: true, logs });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ================== 🔹 Seed Users ==================
app.get("/api/users/seed", async (req, res) => {
  try {
    await User.deleteMany({});
    await User.insertMany([
      { name: "Lakshana S", email: "lakshana@gmail.com", password: "1234", role: "student" },
      { name: "Sarathram M S", email: "sarathram@gmail.com", password: "1234", role: "student" },
      { name: "Naveen Bharath R", email: "naveenbharath@gmail.com", password: "1234", role: "student" },
      { name: "Jananishree", email: "jananishree@gmail.com", password: "1234", role: "advisor" },
      { name: "Sundar G", email: "sundarg@gmail.com", password: "1234", role: "hod" },
      { name: "Security Officer", email: "security@class2gate.com", password: "1234", role: "security" },
      { name: "Admin", email: "admin@class2gate.com", password: "admin123", role: "admin" },
    ]);

    res.json({ ok: true, message: "✅ All sample users added successfully" });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ================== 🔹 Start Server ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 Server listening on port ${PORT}`));
