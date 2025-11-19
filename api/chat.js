const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MODEL = "gemini-1.5-flash"; 
// Note: If you confirmed 2.5 works for you earlier, you can change above to "gemini-2.5-flash"

export default async function handler(req, res) {
  // --- 1. THE SECURITY DOORMAN (CORS Headers) ---
  // This allows your website to talk to this server function
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle the "Pre-flight" check from the browser
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Ensure only POST requests are allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // --- 2. GET DATA FROM YOUR WEBSITE ---
    const { prompt } = req.body;

    // --- 3. CALL GOOGLE GEMINI ---
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();

    // --- 4. SEND ANSWER BACK TO WEBSITE ---
    if (response.ok) {
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return res.status(200).json({ response: text });
    } else {
      console.error("Gemini API Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "Unknown Error" });
    }

  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
