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
            return new Response(JSON.stringify({ result: "❌ Configuration Error: API Key missing in Vercel." }), { 
                headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
            });
        }

        // 🟢 SMART STRATEGY: Try modern model first, fallback to legacy if it fails
        const modelsToTry = ["gemini-1.5-flash", "gemini-1.0-pro"];
        let lastError = "";

        for (const model of modelsToTry) {
            try {
                console.log(`Attempting connection with model: ${model}`);
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

                // If this model works, return the answer immediately
                if (!data.error && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    return new Response(JSON.stringify({ result: data.candidates[0].content.parts[0].text }), {
                        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
                    });
                }
                
                // If error, save it and continue to the next model
                if (data.error) {
                    lastError = data.error.message;
                    console.warn(`Model ${model} failed: ${lastError}`);
                }

            } catch (e) {
                lastError = e.message;
            }
        }

        // If ALL models fail, return the error
        return new Response(JSON.stringify({ result: `❌ Google API Error (All Models Failed): ${lastError}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });

    } catch (error) {
        return new Response(JSON.stringify({ result: `❌ System Error: ${error.message}` }), { 
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
        });
    }
}
