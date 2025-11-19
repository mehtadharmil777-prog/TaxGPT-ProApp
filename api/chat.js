// api/chat.js
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-pro";

export default async function handler(req, res) {
  // 1. THE DOORMAN (Security Headers)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // 2. Handle the security check
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 3. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 4. Talk to Gemini
  try {
    const { prompt, image } = req.body;

    const parts = [{ text: prompt }];
    if (image) {
        parts.push({ inlineData: { mimeType: "image/jpeg", data: image } });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ role: "user", parts }] })
    });

    const data = await response.json();

    if (response.ok) {
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ response: text });
    } else {
        return res.status(response.status).json({ error: data.error?.message });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
