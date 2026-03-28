import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { prisma } from 'lib/prisma';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MoodService {
    constructor(private auditService: AuditService) { }

    async createMoodLog(userId: string, data: { dominantEmotion: string; sentimentScore: number; stressLevel: number; notes?: string }) {
        try {
            const mood = await prisma.moodLog.create({
                data: {
                    ...data,
                    userId,
                },
            });
            await this.auditService.logAction(userId, 'MOODLOG_CREATED', { emotion: data.dominantEmotion });
            return mood;
        } catch (error) {
            console.error('Failed to create mood log:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    async getMoodLogs(userId: string) {
        try {
            return prisma.moodLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            console.error('Failed to get mood logs:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    async getWeeklyStats(userId: string) {
        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            const logs = await prisma.moodLog.findMany({
                where: {
                    userId,
                    createdAt: { gte: sevenDaysAgo },
                },
                orderBy: { createdAt: 'asc' },
            });

            // Group by date
            const days: Record<string, { date: string; entries: typeof logs }> = {};
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                days[key] = { date: key, entries: [] };
            }

            for (const log of logs) {
                const key = log.createdAt.toISOString().split('T')[0];
                if (days[key]) days[key].entries.push(log);
            }

            // Build daily timeline
            const dailyTimeline = Object.values(days).map(({ date, entries }) => {
                const avg = (arr: number[]) =>
                    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
                return {
                    date,
                    avgSentiment: avg(entries.map((e) => e.sentimentScore)),
                    avgStress: avg(entries.map((e) => e.stressLevel)),
                    count: entries.length,
                    dominantEmotion: entries.length
                        ? this.mostFrequent(entries.map((e) => e.dominantEmotion))
                        : null,
                };
            });

            // Emotion distribution (pie chart)
            const emotionMap: Record<string, number> = {};
            for (const log of logs) {
                emotionMap[log.dominantEmotion] = (emotionMap[log.dominantEmotion] || 0) + 1;
            }
            const emotionDistribution = Object.entries(emotionMap).map(([name, value]) => ({ name, value }));

            // Overall summary
            const totalLogs = logs.length;
            const overallAvgSentiment = totalLogs
                ? logs.reduce((a, b) => a + b.sentimentScore, 0) / totalLogs
                : 0;
            const overallAvgStress = totalLogs
                ? logs.reduce((a, b) => a + b.stressLevel, 0) / totalLogs
                : 0;
            const dominantEmotion = totalLogs
                ? this.mostFrequent(logs.map((l) => l.dominantEmotion))
                : null;

            return {
                dailyTimeline,
                emotionDistribution,
                summary: {
                    totalLogs,
                    overallAvgSentiment: Math.round(overallAvgSentiment * 100) / 100,
                    overallAvgStress: Math.round(overallAvgStress * 10) / 10,
                    dominantEmotion,
                },
            };
        } catch (error) {
            console.error('Failed to get weekly stats:', error);
            throw new InternalServerErrorException(
                (error as Error)?.message,
            );
        }
    }

    private mostFrequent(arr: string[]): string {
        const freq: Record<string, number> = {};
        for (const item of arr) freq[item] = (freq[item] || 0) + 1;
        return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
    }


}
