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
        const { message } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ result: "❌ Configuration Error: GEMINI_API_KEY is missing in Vercel." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        // Auto-Discovery of available Gemini models to prevent 404s (Self-Healing Backend)
        let validModel = "models/gemini-1.5-flash"; // Default fallback
        
        try {
            const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const listData = await listResp.json();
            if (listData.models) {
                const found = listData.models.find(m => m.name.includes('gemini-1.5') && m.supportedGenerationMethods.includes('generateContent'));
                if (found) validModel = found.name;
            }
        } catch (e) {
            // Ignore discovery errors and use fallback
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${validModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot, a professional tax assistant. Answer professionally: ${message}`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();
        
        if (data.error) {
            return new Response(JSON.stringify({ result: `❌ Google API Error: ${data.error.message}` }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned.";

        return new Response(JSON.stringify({ result: answer }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ Server Error: ${error.message}` }), { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
}
