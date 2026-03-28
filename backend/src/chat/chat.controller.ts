import {
    Controller,
    Get,
    Post,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @Post()
    createChat(@Request() req, @Body('title') title: string) {
        return this.chatService.createChat(req.user.id, title);
    }

    @Get()
    getUserChats(@Request() req) {
        return this.chatService.getUserChats(req.user.id);
    }

    @Get(':id/messages')
    getChatMessages(@Request() req, @Param('id') id: string) {
        return this.chatService.getChatMessages(id, req.user.id);
    }

    @Post(':id/message')
    sendMessage(
        @Request() req,
        @Param('id') id: string,
        @Body('content') content: string,
    ) {
        return this.chatService.sendMessage(id, req.user.id, content);
    }

    @Delete(':id')
    deleteChat(@Request() req, @Param('id') id: string) {
        return this.chatService.deleteChat(id, req.user.id);
    }
}
