import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ProfileService } from './src/profile/profile.service';
import { PrismaClient } from '@prisma/client';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const profileService = app.get(ProfileService);
  const prisma = new PrismaClient();
  
  const user = await prisma.user.findFirst();
  if (user) {
    console.log("Testing summary for", user.id);
    const res = await profileService.getUserProfileSummary(user.id);
    console.log("RESULT AI EVALUATION:", JSON.stringify(res.data.aiEvaluation, null, 2));
  }
  await app.close();
}
bootstrap();
