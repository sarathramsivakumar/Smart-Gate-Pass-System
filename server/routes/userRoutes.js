import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

const router = express.Router();
const SECRET_KEY = "smartgate_secret_123";

// ---- Register User ----
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, error: "User not found" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.json({ ok: false, error: "Invalid password" });

    // ✅ Send user info (without password)
    res.json({
      ok: true,
      message: "Login successful",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId || null,
      },
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});


// ---- Login User ----
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.json({ ok: false, error: "User not found" });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.json({ ok: false, error: "Invalid password" });

    const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ ok: true, token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
