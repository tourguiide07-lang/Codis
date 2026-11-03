import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "32kb" }));
app.use(rateLimit({ windowMs: 60_000, max: 30, standardHeaders: true, legacyHeaders: false }));

app.get("/", (_req, res) => res.json({ name: "CODIS API", status: "online" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "Server owner must configure OPENAI_API_KEY." });
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) return res.status(400).json({ error: "Message is required." });
  if (message.length > 8000) return res.status(413).json({ error: "Message is too long." });

  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-10) : [];
  const messages = [
    { role: "system", content: "You are CODIS, a helpful personal AI assistant. Be clear, practical, and honest. Do not claim to perform actions you cannot perform." },
    ...history.filter(x => x && ["user", "assistant"].includes(x.role) && typeof x.content === "string").map(x => ({ role: x.role, content: x.content.slice(0, 8000) })),
    { role: "user", content: message }
  ];
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", messages, max_tokens: 700 })
    });
    const data = await response.json();
    if (!response.ok) {
      const detail = data?.error?.message || "AI provider request failed.";
      return res.status(response.status === 429 ? 429 : 502).json({ error: detail });
    }
    return res.json({ reply: data.choices?.[0]?.message?.content || "I couldn't produce a reply." });
  } catch (err) {
    console.error("AI request failed:", err);
    return res.status(502).json({ error: "Could not reach the AI provider. Please try again." });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, "0.0.0.0", () => console.log(`CODIS API listening on ${port}`));
