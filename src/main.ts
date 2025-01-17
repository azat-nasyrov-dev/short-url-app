import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  const app = await NestFactory.create(AppModule);
  // TODO: Optionally you can add a global prefix
  /*
    app.setGlobalPrefix('api');
   */
  app.enableCors();

  await app.listen(PORT, () => console.log(`App is running on port: ${PORT}`));
}
bootstrap();
