export default async function handler(req, res) {
    // 1. Enable CORS so your website can talk to this function
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        // 2. Parse the incoming message
        const { message } = req.body;

        // 3. Get the API Key securely from Vercel (You already set this up!)
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

        if (!GEMINI_API_KEY) {
            throw new Error('Server Config Error: API Key is missing in Vercel.');
        }

        // 4. Call Google Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot, an elite tax research AI. 
                            User Question: ${message}
                            
                            Instructions:
                            - Answer based on 2025 tax regulations.
                            - Be specific (mention rates, thresholds).
                            - Use Markdown formatting (bolding, lists).
                            - End with a citation source in brackets like [Source: IRS].`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        // 5. Send the answer back to the frontend
        if (data.candidates && data.candidates[0].content) {
            res.status(200).json({ result: data.candidates[0].content.parts[0].text });
        } else {
            throw new Error('No response from AI provider.');
        }

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "TaxPilot is experiencing high traffic. Please try again." });
    }
}
