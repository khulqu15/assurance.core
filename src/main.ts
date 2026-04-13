import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const allowedOrigins = [
    'http://localhost:8100',
    'http://127.0.0.1:8100',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://assurance.obayan.id',
    'http://assurance.obayan.id',
    'https://insurance.obayan.id',
    'http://insurance.obayan.id',
    'https://obayan.id',
    'http://obayan.id',

    // tambahkan ini jika frontend/backend diakses via ngrok
    /^https:\/\/[a-z0-9-]+\.ngrok-free\.app$/,
    /^https:\/\/[a-z0-9-]+\.ngrok\.app$/,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) => {
        if (typeof allowed === 'string') return allowed === origin;
        return allowed.test(origin);
      });

      if (isAllowed) return callback(null, true);

      console.error('CORS blocked origin:', origin);
      return callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['set-cookie'],
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();