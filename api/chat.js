export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    // 1. CORS Setup
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
            return new Response(JSON.stringify({ result: "❌ Error: API Key missing in Vercel Settings." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        // 2. Discover Models (Solves 404/Not Found Errors)
        const listResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const listData = await listResponse.json();
        
        let validModel = "models/gemini-1.5-flash"; // Default assumption
        
        // Find a valid model from your account's list
        if (listData.models) {
            const bestModel = listData.models.find(m => 
                m.supportedGenerationMethods?.includes("generateContent") &&
                (m.name.includes("gemini") || m.name.includes("1.5"))
            );
            if (bestModel) validModel = bestModel.name;
        }

        // 3. Generate Answer
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${validModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot. Answer professionally: ${message}`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ result: `❌ Google API Error: ${data.error.message}` }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned.";

        return new Response(JSON.stringify({ result: answer }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ System Error: ${error.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
}
