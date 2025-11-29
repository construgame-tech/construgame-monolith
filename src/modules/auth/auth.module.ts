import { EmailModule } from "@infrastructure/services/email/email.module";
import { SmsModule } from "@infrastructure/services/sms/sms.module";
import { SsmService } from "@infrastructure/services/ssm/ssm.service";
import { WhatsAppModule } from "@infrastructure/services/whatsapp/whatsapp.module";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MemberModule } from "../member/member.module";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";

@Module({
  imports: [
    ConfigModule,
    UserModule,
    MemberModule,
    PassportModule,
    EmailModule,
    SmsModule,
    WhatsAppModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // Em produção, o secret será carregado do SSM pelo SsmService
        // Aqui usamos um placeholder que será substituído dinamicamente
        const secret =
          configService.get<string>("JWT_SECRET") || "dev_secret_key";
        return {
          secret,
          signOptions: { expiresIn: "30m" },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, SsmService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
