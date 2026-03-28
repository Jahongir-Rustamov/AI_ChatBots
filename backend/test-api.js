const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst();
  
  if (!user) return console.log("No user");
  const aiAnalyses = await prisma.aIAnalysis.findMany({ where: { userId: user.id }, take: 1, orderBy: { createdAt: 'desc' } });
  
  console.log("Last AI analysis raw response:", aiAnalyses[0]);
}

test();
