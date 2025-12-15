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
            return new Response(JSON.stringify({ result: "❌ Error: API Key missing in Vercel." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        // 🟢 STEP 1: Ask Google "What models are available to this Key?"
        // This solves the "Model Not Found" error by finding the EXACT name your account uses.
        const listResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        
        const listData = await listResponse.json();
        
        let validModel = "models/gemini-1.5-flash"; // Fallback default
        
        // Pick the best available model from your specific list
        if (listData.models) {
            const bestModel = listData.models.find(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes("generateContent") &&
                (m.name.includes("gemini") || m.name.includes("1.5"))
            );
            if (bestModel) validModel = bestModel.name;
        }

        // 🟢 STEP 2: Use that valid model to generate the answer
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${validModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot. Answer this tax question professionally: ${message}`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            return new Response(JSON.stringify({ result: `❌ Model Error (${validModel}): ${data.error.message}` }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        const answer = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        return new Response(JSON.stringify({ result: answer || "No text returned." }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ System Crash: ${error.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
}
