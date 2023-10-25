import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { EmailRepository } from './email.repository';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    PrismaModule,
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: process.env.EMAILHOST,
          port: process.env.EMAILPORT,
          secure: false,
          auth: {
            user: process.env.EMAILADDRESS,
            pass: process.env.EMAILPASSWORD,
          },
        },
        defaults: {
          from: `"내일은 최저가" <${process.env.EMAILADDRESS}>`,
        },
      }),
    }),
  ],
  controllers: [EmailController],
  providers: [EmailService, EmailRepository],
})
export class emailModule {}
