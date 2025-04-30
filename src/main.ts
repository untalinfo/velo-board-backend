import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: '*', // En producción, sé más específico: 'http://localhost:3000' o tu dominio frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Configurar ValidationPipe globalmente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // Lanza error si hay propiedades no esperadas
      transform: true, // Transforma el payload al tipo del DTO
      transformOptions: {
        enableImplicitConversion: true, // Intenta convertir tipos primitivos automáticamente
      },
    }),
  );

  const configService = app.get<ConfigService>(ConfigService);
  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`
    📚 MongoDB is connected to: ${process.env.MONGODB_URI || 'mongodb://localhost:27017/veloboard'}`);
}
bootstrap();
