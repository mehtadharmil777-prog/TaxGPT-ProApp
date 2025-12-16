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

        // 2. DYNAMIC DISCOVERY: Ask Google what models are available for THIS key
        let targetModel = "";
        
        try {
            const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            const listData = await listResponse.json();

            if (!listData.models) {
                throw new Error("Google returned no models. Is the API enabled?");
            }

            // Filter for models that support 'generateContent'
            const availableModels = listData.models.filter(m => 
                m.supportedGenerationMethods && 
                m.supportedGenerationMethods.includes("generateContent")
            );

            if (availableModels.length === 0) {
                throw new Error("No text-generation models found for this API Key.");
            }

            // PREFERENCE LOGIC: Try to find Flash -> Pro -> Any Gemini -> Any
            const preferred = availableModels.find(m => m.name.includes("flash")) || 
                              availableModels.find(m => m.name.includes("pro")) ||
                              availableModels.find(m => m.name.includes("gemini")) ||
                              availableModels[0];

            targetModel = preferred.name; // Use the EXACT name Google gave us

        } catch (discoveryError) {
            // Fallback if discovery fails (rare)
            console.error("Discovery failed:", discoveryError);
            targetModel = "models/gemini-1.5-flash"; 
        }

        // 3. GENERATE CONTENT using the discovered model
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/${targetModel}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are TaxPilot, a professional tax assistant. Answer concisely and accurately: ${message}`
                        }]
                    }]
                })
            }
        );

        const data = await response.json();

        // 4. ERROR HANDLING
        if (data.error) {
            return new Response(JSON.stringify({ 
                result: `❌ API Error using model '${targetModel}': ${data.error.message}` 
            }), { 
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
