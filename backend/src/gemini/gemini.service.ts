import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as JSON5 from 'json5';

@Injectable()
export class GeminiService {
    private genAI: GoogleGenerativeAI;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('GEMINI_API_KEY');
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not set in the environment variables.');
        }
        this.genAI = new GoogleGenerativeAI(apiKey || 'dummy');
    }

    async analyzeAndChat(userMessage: string, chatHistory: { senderRole: string; content: string }[]) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-3-flash-preview'
            });

            const systemPrompt = `Siz "MindCare AI" — O'zbekistonning birinchi professional ruhiy salomatlik yordamchisisiz. Siz klinikalik psixologiya, kognitiv-xulq terapiyasi (CBT) va mindfulness asosida ishlaysiz. Faqat O'ZBEK TILIDA muloqot qilasiz.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 ROL VA VAKOLATLAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Siz faqat quyidagi sohalarda yordam berasiz:
• Ruhiy salomatlik va hissiy qo'llab-quvvatlash
• Stress, tashvish, depressiya va kayfiyat masalalari
• Shaxsiy munosabatlar va muloqot qiyinchiliklari
• O'z-o'zini rivojlantirish va psixologik barqarorlik
• Uyqu, charchoq va motivatsiya muammolari

━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ MUHIM QOIDALAR
━━━━━━━━━━━━━━━━━━━━━━━━━━━

QOIDA 1 — MAVZU TEKSHIRUVI:
Agar savol ruhiy salomatlikka umuman aloqador bo'lmasa (masalan: texnologiya, matematika, tarix, yemak retsepti, dasturlash va h.k.), quyidagi tarzda muloyimlik bilan rad eting:
"Hurmatli foydalanuvchi, men faqat ruhiy salomatlik va hissiy qo'llab-quvvatlash bo'yicha ixtisoslashganman. Bu mavzuda sizga yordam bera olmayman. Lekin agar qalbingizda biror yukning og'irligi bo'lsa, men doim shu yerdaman 💙"

QOIDA 2 — MUAMMO/STRESS HOLATI:
Foydalanuvchi muammo, stress, xavotir, tushkunlik yoki og'ir holat haqida yozsa, "reply" maydoni QUYIDAGI TARZDA tuzilishi SHART:

1. Empatik kirish (1-2 gap — foydalanuvchining his-tuyg'ularini tan oling)
2. Professional tahlil (2-3 gap — holatni psixologik nuqtai nazardan izohlang)
3. 5 TA AMALIY MASLAHAT — har biri BOSHQA EMOJI bilan, aniq va qo'llaniladigan:
   1-chi 🌿 [Maslahat nomi]: [Batafsil izoh]
   2-chi 🧘 [Maslahat nomi]: [Batafsil izoh]
   3-chi 💪 [Maslahat nomi]: [Batafsil izoh]
   4-chi 📔 [Maslahat nomi]: [Batafsil izoh]
   5-chi 🌅 [Maslahat nomi]: [Batafsil izoh]
   (Emojilar har safar mavzuga mos tarzda o'zgartirilsin)
4. PROFESSIONAL XULOSA:
   ✨ Xulosa: [2-3 gap — ilmiy asoslangan, umid beruvchi, kuchli yakunlovchi fikr]

QOIDA 3 — ODDIY SALOMLASHISH:
Foydalanuvchi qisqa/oddiy gaplar yozsa (Salom, Rahmat, Qanday ishlar va h.k.), FAQAT qisqa, issiq va do'stona javob bering. Maslahat shart emas.

QOIDA 4 — INQIROZLI HOLAT:
Foydalanuvchi o'ziga zarar yetkazish yoki hayotdan umid uzish haqida yozsa, darhol professional yordam olishga yo'llang va riskLevel ni HIGH ga o'rnating.

━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 JSON FORMATI (MAJBURIY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━
Javobni FAQAT quyidagi JSON formatida qaytaring, boshqa hech narsa qo'shmang:

{
  "reply": "Yuqoridagi qoidalarga muvofiq tuzilgan to'liq javob",
  "emotion": "Foydalanuvchining asosiy hissiyoti (masalan: Xavotir, Tushkunlik, Quvonch, Yolg'izlik, Charchoq)",
  "sentimentScore": -1.0,
  "riskLevel": "LOW/MEDIUM/HIGH",
  "suggestions": "Keyingi sesiya uchun 3-4 ta qisqa professional tavsiya (vergul bilan ajratilgan)",
  "confidence": 0.95
}`;

            const formattedHistory = chatHistory.map((h) => ({
                role: h.senderRole === 'USER' ? 'user' : 'model',
                parts: [{ text: h.content }],
            }));

            // Prepend system prompt to the first user message or as a separate turn if supported,
            // but here we'll just prepend it to the context if history is empty or to the first message.
            if (formattedHistory.length === 0) {
                formattedHistory.push({
                    role: 'user',
                    parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}\n\nFoydalanuvchi: ${userMessage}` }],
                });
            } else {
                // If there's history, we'll try to keep the system instruction at the very beginning
                formattedHistory.unshift({
                    role: 'user',
                    parts: [{ text: `SYSTEM INSTRUCTION: ${systemPrompt}` }],
                });
                formattedHistory.push({
                    role: 'user',
                    parts: [{ text: userMessage }],
                });
            }

            const chat = model.startChat({ history: formattedHistory.slice(0, -1) });
            const result = await chat.sendMessage(formattedHistory[formattedHistory.length - 1].parts[0].text);
            const responseText = result.response.text();

            return this.extractJSON(responseText);
        } catch (error: any) {
            console.error('\n=============================================');
            console.error('❌ Gemini API Xatolik (Chat tuguni)');
            console.error('=============================================');

            console.error('🛑 Xato xabari:', error?.message || error);
            console.error('=============================================\n');

            // Fallback info for the user (More user-friendly strings)
            const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
            const errorMessage = isQuotaError
                ? 'Kechirasiz, so\'rovlar limiti tugadi. Iltimos, 1-2 daqiqa dam oling va keyin qayta urinib ko\'ring. 😊'
                : 'Hozirda AI xizmatida biroz texnik nosozlik yuz berdi. Iltimos, birozdan so\'ng qayta urinib ko\'ring. ✨';

            throw new InternalServerErrorException(errorMessage);
        }
    }

    async generateProfileSummary(moodData: any[], analysisData: any[]) {
        try {
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash-lite',
            });

            const systemInstruction = `Siz professional va empatik Psixologsiz.
Quyida foydalanuvchining so'nggi kayfiyat yozuvlari va AI tahlillari berilgan.
Buni tahlil qilib, quyidagi JSON formatda javob bering va undan boshqa matn qo'shmang:
{
  "summary": "Foydalanuvchining psixologik holati bo'yicha yakuniy professional xulosa (kamida 3-4 gap)",
  "advices": [
    "1-maslahat", "2-maslahat", "3-maslahat", "4-maslahat", "5-maslahat"
  ],
  "chartData": {
    "labels": ["Quvonch", "Tushkunlik", "Xavotir"],
    "data": [50, 20, 30]
  }
}
chartData qismi foydalanuvchining hissiyotlarining uchrash foizi yoki soni (umumiy 100% yoki aniq sonlar) bo'lsin.`;

            const prompt = `${systemInstruction}\n\nFoydalanuvchi ma'lumotlari:
            Kayfiyat yozuvlari: ${JSON.stringify(moodData)}
            Chat tahlillari: ${JSON.stringify(analysisData)}
            Iltimos tahlil qiling.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            return this.extractJSON(responseText);
        } catch (error: any) {
            console.error('\n=============================================');
            console.error('❌ Gemini API Xatolik (Profil Xulosasi)');
            console.error('=============================================');

            console.error('🛑 Xato xabari:', error?.message || error);
            console.error('=============================================\n');

            const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('quota');
            const errorMessage = isQuotaError
                ? 'AI xulosa shakllantirish limitiga yetdi. Iltimos biroz kuting. ⏳'
                : 'Profil xulosasini yaratishda biroz xatolik yuz berdi. Keyinroq qayta urinib ko\'ring. 🔄';

            throw new InternalServerErrorException(errorMessage);
        }
    }

    private extractJSON(text: string) {
        let cleanedText = text;
        try {
            // Remove markdown syntax if present
            const markdownMatch = text.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
            if (markdownMatch) {
                cleanedText = markdownMatch[1];
            } else {
                // Find the first '{' and the last '}'
                const firstBrace = text.indexOf('{');
                const lastBrace = text.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1) {
                    cleanedText = text.substring(firstBrace, lastBrace + 1);
                }
            }

            // Further clean common AI mistakes
            cleanedText = cleanedText
                .replace(/\\"/g, '"') // sometimes AI double-escapes quotes
                .trim();

            return JSON5.parse(cleanedText);
        } catch (error) {
            console.error('\n=============================================');
            console.error('❌ JSON Parsing Error');
            console.error('=============================================');
            console.error('Raw AI Response:', text);
            console.error('Cleaned Text:', cleanedText);
            console.error('Error Details:', error);
            console.error('=============================================\n');

            throw new Error('Javobni tahlil qilishda xatolik yuz berdi (Invalid JSON format)');
        }
    }
}
