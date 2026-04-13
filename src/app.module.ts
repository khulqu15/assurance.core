import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UsersModule } from './modules/users/users.module';
import { ClaimsModule } from './modules/claims/claims.module';
import { databaseConfig } from './database.config';
import { EmailModule } from './modules/email/email.module';

const dataRoot = process.env.RAILWAY_VOLUME_MOUNT_PATH || '/data';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()),
    ServeStaticModule.forRoot({
      rootPath: join(dataRoot, 'uploads'),
      serveRoot: '/public',
    }),
    EmailModule,
    UsersModule,
    ClaimsModule,
  ],
})
export class AppModule {}