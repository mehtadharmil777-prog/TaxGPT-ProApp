export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // 1. CORS Headers
    if (req.method === 'OPTIONS') {
        return new Response(null, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    try {
        // 2. Check API Key
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ result: "❌ Error: Vercel Environment Variable 'GEMINI_API_KEY' is missing." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const { message } = await req.json();

        // 3. Call Google Gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot. Answer this tax question professionally and concisely: ${message}`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        // 4. ERROR TRAPPING (This is what was missing)
        if (data.error) {
            return new Response(JSON.stringify({ result: `❌ Google API Error: ${data.error.message}` }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!answer) {
             return new Response(JSON.stringify({ result: "❌ Error: Google returned empty response. Check safety settings." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        // 5. Success
        return new Response(JSON.stringify({ result: answer }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ System Crash: ${error.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
}
