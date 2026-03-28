import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

async function listAllModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY is not set');
        return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    try {
        console.log("Checking gemini-3-flash-preview...");
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
        const result = await model.generateContent("Hi");
        console.log("gemini-3-flash-preview works!");
    } catch (e) {
        console.error("gemini-3-flash-preview failed:", e.message);
    }
    try {
        console.log("Checking gemini-3.1-flash-lite-preview...");
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
        const result = await model.generateContent("Hi");
        console.log("gemini-3.1-flash-lite-preview works!");
    } catch (e) {
        console.error("gemini-3.1-flash-lite-preview failed:", e.message);
    }
}

listAllModels();
