import { Module, Logger } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('MAIL_HOST');
        const port = Number(configService.get<string>('MAIL_PORT') ?? 587);
        const user = configService.get<string>('MAIL_USER');
        const pass = configService.get<string>('MAIL_PASS');
        const from =
          configService.get<string>('MAIL_FROM') ?? 'no-reply@example.com';

        const logger = new Logger('EmailModule');
        logger.log(
          `Mailer config loaded: host=${host}, port=${port}, user=${user ? '[set]' : '[missing]'}`,
        );

        if (!host) {
          throw new Error('MAIL_HOST is missing');
        }

        if (!user) {
          throw new Error('MAIL_USER is missing');
        }

        if (!pass) {
          throw new Error('MAIL_PASS is missing');
        }

        return {
          transport: {
            host,
            port,
            secure: port === 465,
            auth: {
              user,
              pass,
            },
          },
          defaults: {
            from,
          },
        };
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}