import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { prisma } from 'lib/prisma';
import { GeminiService } from '../gemini/gemini.service';
import { SenderRole, RiskLevel } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ChatService {
    constructor(
        private readonly geminiService: GeminiService,
        private readonly auditService: AuditService,
    ) { }

    async createChat(userId: string, title?: string) {
        try {
            return await prisma.chat.create({
                data: {
                    userId,
                    title: title || 'Yangi suhbat',
                },
            });
        } catch (error) {
            console.error('Failed to create chat:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    async getUserChats(userId: string) {
        try {
            return await prisma.chat.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                include: {
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
        } catch (error) {
            console.error('Failed to get user chats:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    async getChatMessages(chatId: string, userId: string) {
        try {
            const chat = await prisma.chat.findUnique({
                where: { id: chatId, userId },
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        include: { aiAnalysis: true },
                    },
                },
            });

            if (!chat) {
                throw new NotFoundException('Suhbat topilmadi');
            }

            return chat.messages;
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Failed to get chat messages:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    async deleteChat(chatId: string, userId: string) {
        try {
            const chat = await prisma.chat.findUnique({
                where: { id: chatId, userId },
            });

            if (!chat) {
                throw new NotFoundException('Suhbat topilmadi');
            }

            await prisma.chat.delete({
                where: { id: chatId },
            });

            await this.auditService.logAction(userId, 'CHAT_DELETED', { chatId });

            return { message: 'Suhbat muvaffaqiyatli o\'chirildi' };
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            console.error('Failed to delete chat:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    async sendMessage(chatId: string, userId: string, content: string) {
        // 1. Verify chat belongs to user and fetch history (outside transaction — read-only)
        const chat = await prisma.chat.findUnique({
            where: { id: chatId, userId },
            include: { messages: { orderBy: { createdAt: 'asc' } } },
        });

        if (!chat) {
            throw new NotFoundException('Suhbat topilmadi');
        }

        // 2. Call Gemini FIRST before writing anything to DB
        //    If AI fails, nothing will be saved (no orphaned user messages)
        const chatHistory = chat.messages.map((m) => ({
            senderRole: m.senderRole,
            content: m.content,
        }));

        let aiResponse: any;
        try {
            aiResponse = await this.geminiService.analyzeAndChat(content, chatHistory);
        } catch (aiError: any) {
            // AI failed — do NOT save anything to DB, re-throw for the controller
            console.error('AI responded with error, nothing saved to DB:', aiError?.message);
            throw aiError;
        }

        // 3. AI succeeded — now persist everything atomically
        try {
            const result = await prisma.$transaction(async (tx) => {
                // Save user message
                const userMessage = await tx.message.create({
                    data: {
                        chatId,
                        content,
                        senderRole: 'USER',
                    },
                });

                // Save AI response
                const assistantMessage = await tx.message.create({
                    data: {
                        chatId,
                        content: aiResponse.reply,
                        senderRole: 'ASSISTANT',
                        sentiment: String(aiResponse.sentimentScore),
                        emotion: aiResponse.emotion,
                        confidence: aiResponse.confidence || undefined,
                    },
                });

                // Save AI Analysis if available
                let analysisResult: any = null;
                if (aiResponse.emotion || aiResponse.sentimentScore || aiResponse.riskLevel) {
                    analysisResult = await tx.aIAnalysis.create({
                        data: {
                            userId,
                            messageId: assistantMessage.id,
                            detectedEmotion: aiResponse.emotion || 'Not detected',
                            sentimentScore: aiResponse.sentimentScore || 0,
                            riskLevel: (aiResponse.riskLevel as RiskLevel) || 'LOW',
                            suggestions: aiResponse.suggestions || '',
                        },
                    });
                }

                // Auto-generate title on first message
                if (chat.messages.length === 0) {
                    await tx.chat.update({
                        where: { id: chatId },
                        data: { title: content.substring(0, 30) },
                    });
                }

                return { userMessage, assistantMessage, analysis: analysisResult };
            });

            return result;
        } catch (dbError: any) {
            console.error('DB transaction failed after successful AI response:', dbError?.message);
            throw new InternalServerErrorException(
                'Xabarni saqlashda xatolik yuz berdi: ' + dbError?.message,
            );
        }
    }
}
