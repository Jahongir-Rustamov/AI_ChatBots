import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { prisma } from 'lib/prisma';
import { GeminiService } from '../gemini/gemini.service';

@Injectable()
export class ProfileService {
    constructor(private readonly geminiService: GeminiService) { }

    async getUserProfileSummary(userId: string) {
        try {
            const moodLogs = await prisma.moodLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            const aiAnalyses = await prisma.aIAnalysis.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 10,
            });

            let aiSummary = null;
            try {
                aiSummary = await this.geminiService.generateProfileSummary(moodLogs, aiAnalyses);
            } catch (aiError) {
                console.error('AI Summary generation failed:', aiError);
            }

            return {
                status: 'success',
                data: {
                    moodLogs,
                    aiAnalyses,
                    aiEvaluation: aiSummary,
                }
            };
        } catch (error) {
            console.error('Failed to get user profile summary:', error);
            throw new InternalServerErrorException(
                'Error in getting user profile summary ==> ' + (error as Error)?.message,
            );
        }
    }
}
