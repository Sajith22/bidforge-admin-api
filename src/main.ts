import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ CORS enable කරන්න - development සඳහා
  app.enableCors();

  // 🚀 හරියටම frontend origin එක set කිරීම (recommended)
  // app.enableCors({
  //   origin: 'http://localhost:5173', // ඔබේ frontend URL
  //   credentials: true, // cookies/auth headers අවශ්ය නම්
  // });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();