// Optional: real AI replies for the Discord app.
//
// Vercel runs this file as a serverless function at /api/chat. It only works
// when you add an environment variable in Vercel:
//   Project -> Settings -> Environment Variables -> ANTHROPIC_API_KEY = your key
// Without a key it returns 501 and Discord quietly uses its built-in replies.
//
// Your key stays on the server; visitors never see it. To keep costs tiny,
// replies are short and only the last few messages are sent. You can also set
// a monthly spend limit in the Anthropic Console.

const MODEL = "claude-haiku-4-5-20251001";

const clip = (s, n) => String(s == null ? "" : s).slice(0, n);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(501).json({ error: "AI replies are not configured" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const bot = clip(body.bot, 40) || "friend";
  const persona = clip(body.persona, 300);
  const user = clip(body.user, 40) || "the visitor";
  const owner = body.owner || {};
  const facts = [
    `Site owner: ${clip(owner.name, 60)}${owner.role ? `, ${clip(owner.role, 80)}` : ""}.`,
    owner.tagline ? `About them: ${clip(owner.tagline, 200)}` : "",
    Array.isArray(owner.skills) && owner.skills.length ? `Their skills: ${owner.skills.slice(0, 12).map(s => clip(s, 30)).join(", ")}.` : "",
    Array.isArray(owner.projects) && owner.projects.length ? `Their projects: ${owner.projects.slice(0, 8).map(s => clip(s, 60)).join(", ")}.` : "",
  ].filter(Boolean).join("\n");

  // Build alternating user/assistant turns from the recent chat history
  const msgs = [];
  for (const m of (Array.isArray(body.history) ? body.history : []).slice(-12)) {
    const role = m && m.role === "assistant" ? "assistant" : "user";
    const content = clip(m && m.content, 500).trim();
    if (!content) continue;
    if (msgs.length && msgs[msgs.length - 1].role === role) msgs[msgs.length - 1].content += "\n" + content;
    else msgs.push({ role, content });
  }
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return res.status(400).json({ error: "Nothing to reply to" });

  const system = `You are ${bot}, a member of a friendly 1998-themed Discord server that lives inside a Windows 98 style portfolio website.
Your personality: ${persona}
You are chatting with ${user}. Reply like a real chat message: 1-2 short sentences, casual, friendly, PG, no hashtags, no emoji spam.
Respond directly to what was just said; reference their actual words and ask a follow-up question sometimes. Never repeat an earlier reply.
If asked about the site owner, only use these facts and stay positive:
${facts}
If someone sincerely asks whether you are an AI or a bot, say yes.`;

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: MODEL, max_tokens: 120, system, messages: msgs }),
    });
    if (!r.ok) return res.status(502).json({ error: "AI request failed" });
    const data = await r.json();
    const reply = (data.content || []).filter(b => b.type === "text").map(b => b.text).join(" ").trim();
    if (!reply) return res.status(502).json({ error: "Empty reply" });
    return res.status(200).json({ reply: reply.slice(0, 400) });
  } catch (e) {
    return res.status(502).json({ error: "AI request failed" });
  }
}