export const config = {
    runtime: 'edge',
};

// Helper function to try a specific model
async function tryGenerate(modelName, apiKey, message) {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: `You are TaxPilot, a professional tax assistant. Answer professionally and concisely: ${message}`
                }]
            }]
        })
    });

    const data = await response.json();
    
    // If Google returns an error object, throw it to trigger the next model
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text;
}

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

        // 2. THE FIX: Try these 3 models in order. One WILL work.
        const modelsToTry = [
            "models/gemini-1.5-flash", // Best for speed
            "models/gemini-1.5-pro",   // Best for complex tasks
            "models/gemini-pro"        // Oldest/Most stable backup
        ];

        let lastError = null;

        for (const model of modelsToTry) {
            try {
                // Attempt to generate with the current model
                const answer = await tryGenerate(model, apiKey, message);
                
                // If successful, return immediately
                return new Response(JSON.stringify({ result: answer }), {
                    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                });

            } catch (error) {
                // If this model fails, capture error and loop to the next one
                console.log(`Model ${model} failed:`, error.message);
                lastError = error;
                continue; 
            }
        }

        // 3. If ALL models fail, return the last error
        return new Response(JSON.stringify({ result: `❌ Google API Error: All models failed. Last error: ${lastError.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ System Error: ${error.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
}
