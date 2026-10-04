// OncoEase LOCAL backend stub — keys stay HERE, never in the app or GitHub.
// Run: npm install express cors dotenv node-fetch@2
// Then: copy .env.example to .env, fill keys, run: node backend-example.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const FLW_SECRET = process.env.FLW_SECRET_KEY; // sk_test_... or sk_live_...
const OPENAI_KEY = process.env.OPENAI_API_KEY;
const PORT = process.env.PORT || 3001;

// --- Safety system prompt: general info only, never diagnosis/doses ---
const SYSTEM_PROMPT = `You are OncoEase, a compassionate cancer-support companion for Nigerian patients and caregivers.
Rules: 1) General information only, never personal medical advice, diagnosis, or dose instructions. 2) Simple plain language, hopeful but realistic, no outcome promises. 3) Always encourage discussing personal symptoms with their nurse/doctor/pharmacist. 4) If red-flag symptoms (fever, heavy bleeding, severe vomiting, chest pain, trouble breathing, confusion) or self-harm, urge prompt human help and emergency services. 5) Respect culture; be kind. 6) Keep replies under 120 words.`;

// --- Flutterwave: create payment link (server-side only) ---
app.post("/api/pay", async (req, res) => {
  try {
    const { amount, email, currency = "NGN", purpose = "support" } = req.body || {};
    if (!amount || amount < 100) return res.status(400).json({ error: "Minimum ₦100" });
    if (!email) return res.status(400).json({ error: "Email required" });
    if (!FLW_SECRET) return res.status(500).json({ error: "Server missing FLW_SECRET_KEY" });
    const txRef = "CC-" + Date.now();
    const r = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: "Bearer " + FLW_SECRET, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: txRef, amount, currency,
        redirect_url: process.env.PAY_REDIRECT_URL || "https://odun2025.github.io/CANCER-VR-APP/cancercompass-app.html",
        customer: { email },
        customizations: { title: "OncoEase Support", description: "Purpose: " + purpose },
      }),
    });
    const j = await r.json();
    if (j.status === "success" && j.data && j.data.link) return res.json({ link: j.data.link, txRef });
    return res.status(502).json({ error: (j && j.message) || "Flutterwave error" });
  } catch (e) { return res.status(500).json({ error: "Payment init failed" }); }
});

// --- OpenAI chat proxy with guardrails (server-side only) ---
app.post("/api/chat", async (req, res) => {
  try {
    const { message, context } = req.body || {};
    if (!message) return res.status(400).json({ error: "Empty message" });
    if (!OPENAI_KEY) {
      return res.json({ reply: "I’m here with you. (Demo — backend has no AI key yet.) Try a relaxation track or a Learn topic, and ask your care team about anything personal.", demo: true });
    }
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: "Bearer " + OPENAI_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        max_tokens: 220, temperature: 0.4,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Context: " + JSON.stringify(context || {}) + "\n\nPatient: " + String(message).slice(0, 800) },
        ],
      }),
    });
    const j = await r.json();
    const reply = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    return res.json({ reply: (reply || "I’m here with you. Please also speak to your care team.").slice(0, 900) });
  } catch (e) { return res.status(500).json({ error: "Chat failed", reply: "I’m having trouble — please try a relaxation track, and contact your team for anything urgent." }); }
});

app.get("/", (req, res) => res.send("OncoEase backend stub running. POST /api/pay and /api/chat"));
app.listen(PORT, () => console.log("OncoEase backend on http://localhost:" + PORT));
