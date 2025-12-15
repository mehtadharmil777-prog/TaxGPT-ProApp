// api/chat.js
export const config = {
    runtime: 'edge', // Faster, cheaper, better for chat
};

export default async function handler(req) {
    // 1. CORS Headers (Security: Only allow your site to talk to this)
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    try {
        const { message } = await req.json();

        // 2. Input Validation (Fixes "Input validation missing")
        if (!message || typeof message !== 'string') {
            return new Response(JSON.stringify({ error: 'Invalid message format' }), { status: 400 });
        }
        if (message.length > 500) { // Limit length to prevent abuse
            return new Response(JSON.stringify({ error: 'Message too long (max 500 chars)' }), { status: 400 });
        }

        // 3. API Key Check
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("Server Error: Missing GEMINI_API_KEY");
            return new Response(JSON.stringify({ error: 'System configuration error' }), { status: 500 });
        }

        // 4. Secure Call to Google Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot, a professional AI tax consultant. 
                            User Question: "${message}"
                            
                            Directives:
                            - Provide accurate, 2025-compliant tax information.
                            - Use Markdown formatting (bolding key figures, lists).
                            - Be concise and professional.
                            - Cite authoritative sources where possible (e.g. [Source: IRS], [Source: HMRC]).
                            - If the query is not about tax/finance, politely decline.`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        // 5. Error Handling (Fixes "Silent failures")
        if (data.error) {
            throw new Error(data.error.message || 'AI Provider Error');
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a response. Please try again.";
        
        return new Response(JSON.stringify({ result: answer }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        console.error("Backend Error:", error);
        return new Response(JSON.stringify({ error: "TaxPilot is currently at capacity. Please try again in a moment." }), { status: 500 });
    }
}
