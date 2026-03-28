import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [GeminiModule, AuditModule],
  providers: [ChatService],
  controllers: [ChatController]
})
export class ChatModule { }
