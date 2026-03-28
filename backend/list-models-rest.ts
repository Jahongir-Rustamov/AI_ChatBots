import 'dotenv/config';

async function listModelsRest() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available models:");
            data.models.forEach((m: any) => console.log(`- ${m.name} (${m.displayName})`));
        } else {
            console.error("No models found or error:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("REST call failed:", e.message);
    }
}

listModelsRest();
