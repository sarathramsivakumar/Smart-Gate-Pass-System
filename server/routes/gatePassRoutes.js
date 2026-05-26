import express from "express";
import GatePass from "../models/GatePass.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const gatePass = new GatePass(req.body);
    await gatePass.save();
    res.json({ message: "Gate pass created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const passes = await GatePass.find();
    res.json(passes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const pass = await GatePass.findByIdAndUpdate(id, { status }, { new: true });
    res.json(pass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
