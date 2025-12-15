// api/chat.js
export const config = {
    runtime: 'edge', // Essential for speed
};

export default async function handler(req) {
    // 1. CORS Setup (Essential for your frontend to talk to this backend)
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
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'Server Config Error: API Key missing' }), { status: 500 });
        }

        // 2. Call Google Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot, a professional AI tax consultant. 
                            User Question: ${message}
                            
                            Instructions: 
                            - Answer professionally for 2025 tax regulations.
                            - Use Markdown (bolding, lists).
                            - Cite authoritative sources (e.g. [Source: IRS]).
                            - Keep it concise.`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();
        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
        
        return new Response(JSON.stringify({ result: answer }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
