import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';

const app = express();
const port = Number(process.env.PORT || 3000);
const model = process.env.OPENAI_MODEL || 'gpt-6.2-astra';
const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.json({ limit: '32kb' }));
app.use(express.static('public'));

// Lightweight in-memory rate limit. Use a proper shared limiter before public production launch.
const hits = new Map();
app.use('/api/', (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = hits.get(ip) || { start: now, count: 0 };
  if (now - entry.start > 60_000) { entry.start = now; entry.count = 0; }
  entry.count += 1;
  hits.set(ip, entry);
  if (entry.count > 20) return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
  next();
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'THETA LIFE / ATLAS AI', aiConfigured: Boolean(client) }));

app.post('/api/chat', async (req, res) => {
  try {
    if (!client) return res.status(503).json({ error: 'ATLAS is not connected yet. Set OPENAI_API_KEY on the server.' });
    const message = typeof req.body?.message === 'string' ? req.body.message.trim() : '';
    const history = Array.isArray(req.body?.history) ? req.body.history.slice(-12) : [];
    if (!message) return res.status(400).json({ error: 'Please enter a message.' });
    if (message.length > 4000) return res.status(400).json({ error: 'Message is too long (max 4000 characters).' });

    // Only allow short, validated chat history; do not accept system/developer roles from clients.
    const safeHistory = history
      .filter(item => item && ['user', 'assistant'].includes(item.role) && typeof item.content === 'string')
      .map(item => ({ role: item.role, content: item.content.slice(0, 4000) }));

    const response = await client.responses.create({
      model,
      instructions: `You are ATLAS AI, the helpful assistant inside THETA LIFE. Be practical, warm, clear, and concise. Match the user's language when possible. If the user writes Punjabi in Roman script, reply in conversational Punjabi/Roman Punjabi. Do not claim actions you have not performed.`,
      input: [...safeHistory, { role: 'user', content: message }]
    });
    res.json({ reply: response.output_text || 'I could not generate a text response. Please try again.' });
  } catch (err) {
    console.error('ATLAS request failed:', err?.message || err);
    res.status(500).json({ error: 'ATLAS had a problem generating a response. Please try again.' });
  }
});

app.listen(port, () => console.log(`THETA LIFE backend listening on http://localhost:${port}`));
