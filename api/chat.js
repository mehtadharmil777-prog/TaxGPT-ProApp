export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
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
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response(JSON.stringify({ result: "❌ Error: API Key missing in Vercel." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const { message } = await req.json();

        // 🟢 FIX: Switched to 'gemini-pro' (Universal Stability)
        // This resolves the "Model not found" error you saw.
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
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

        if (data.error) {
            return new Response(JSON.stringify({ result: `❌ Google Error: ${data.error.message}` }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return new Response(JSON.stringify({ result: answer || "No text returned." }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ Server Error: ${error.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
}
