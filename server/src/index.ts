import express from "express";
import { fallbackGreetings } from "./fallback.js";
import { AiRefusal, aiEnabled, generateWithClaude } from "./generate.js";
import { GenerateRequest, type GenerateResult } from "./prompt.js";
import { Quota, TtlCache } from "./store.js";

const PORT = Number(process.env.PORT ?? 8787);
const FREE_PER_DAY = Number(process.env.FREE_AI_PER_DAY ?? 5);

const quota = new Quota(FREE_PER_DAY);
const cache = new TtlCache<GenerateResult>(5000, 6 * 60 * 60 * 1000);

const app = express();
app.use(express.json({ limit: "16kb" }));

// Cho phép bản web gọi API. App điện thoại không cần CORS.
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN ?? "*";
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Headers", "content-type, x-device-id");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ ok: true, ai: aiEnabled() });
});

app.post("/api/greetings", async (req, res) => {
  const parsed = GenerateRequest.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request", details: parsed.error.issues });
    return;
  }
  const input = parsed.data;
  const deviceId = String(req.header("x-device-id") ?? req.ip ?? "anon").slice(0, 64);
  const key = JSON.stringify([
    input.occasion,
    input.recipient,
    input.tone,
    input.recipientName?.toLowerCase() ?? "",
    input.senderName?.toLowerCase() ?? "",
    input.note?.toLowerCase() ?? "",
  ]);

  // Cache trúng thì không tính lượt và không tốn tiền AI.
  const cached = cache.get(key);
  if (cached) {
    res.json({ ...cached, source: "cache", remaining: quota.remaining(deviceId) });
    return;
  }

  if (!aiEnabled()) {
    res.json({ ...fallbackGreetings(input), source: "library", remaining: null });
    return;
  }

  if (!quota.take(deviceId)) {
    res.json({ ...fallbackGreetings(input), source: "library", remaining: 0, limitReached: true });
    return;
  }

  try {
    const result = await generateWithClaude(input);
    cache.set(key, result);
    res.json({ ...result, source: "ai", remaining: quota.remaining(deviceId) });
  } catch (err) {
    quota.refund(deviceId);
    console.error("[greetings] AI failed:", err instanceof AiRefusal ? "refusal" : err);
    res.json({ ...fallbackGreetings(input), source: "library", remaining: quota.remaining(deviceId) });
  }
});

app.listen(PORT, () => {
  console.log(`Thiệp Xuân API on :${PORT} (AI ${aiEnabled() ? "on" : "off, using library"})`);
});
