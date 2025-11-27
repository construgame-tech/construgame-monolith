// Test Auth Module - Mock for E2E tests with test versions of Email/SMS
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "../../src/modules/auth/auth.controller";
import { AuthService } from "../../src/modules/auth/auth.service";
import { JwtStrategy } from "../../src/modules/auth/jwt.strategy";
import { UserModule } from "../../src/modules/user/user.module";
import { TestEmailModule } from "./email.module";
import { TestSmsModule } from "./sms.module";
import { TestSsmModule } from "./ssm.module";

@Module({
  imports: [
    ConfigModule,
    UserModule,
    PassportModule,
    TestEmailModule,
    TestSmsModule,
    TestSsmModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET") || "test_secret_key",
        signOptions: { expiresIn: "1d" },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class TestAuthModule {}
