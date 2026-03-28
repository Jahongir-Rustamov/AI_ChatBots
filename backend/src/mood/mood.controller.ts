import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { MoodService } from './mood.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mood')
@UseGuards(JwtAuthGuard)
export class MoodController {
    constructor(private readonly moodService: MoodService) { }

    @Post()
    createMoodLog(@Request() req, @Body() body: any) {
        return this.moodService.createMoodLog(req.user.id, body);
    }

    @Get()
    getMoodLogs(@Request() req) {
        return this.moodService.getMoodLogs(req.user.id);
    }

    @Get('stats/week')
    getWeeklyStats(@Request() req) {
        return this.moodService.getWeeklyStats(req.user.id);
    }
}
