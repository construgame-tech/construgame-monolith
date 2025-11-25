import { UserEntity } from "@domain/user/entities/user.entity";
import { authenticateWithEmail } from "@domain/user/use-cases/authenticate-with-email";
import {
  generateAuthCode,
  validateAuthCode,
} from "@domain/user/use-cases/authenticate-with-phone";
import { changePassword as changePasswordUseCase } from "@domain/user/use-cases/change-password";
import { recoverPassword } from "@domain/user/use-cases/recover-password";
import { UserRepository } from "@infrastructure/repositories/user.repository";
import { EmailService } from "@infrastructure/services/email/email.service";
import { SmsService } from "@infrastructure/services/sms/sms.service";
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
  ) {}

  // Valida usuário com email e senha
  async validateUser(email: string, pass: string): Promise<UserEntity | null> {
    try {
      const result = await authenticateWithEmail(
        { email, password: pass },
        this.userRepository,
        async (plain: string, hashed: string) => {
          return bcrypt.compare(plain, hashed);
        },
      );
      return result.user;
    } catch (error) {
      return null;
    }
  }

  // Login Web (email + password)
  async loginWeb(user: UserEntity) {
    const payload = { username: user.email, sub: user.id, roles: user.type };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        photo: user.photo,
        type: user.type,
      },
    };
  }

  // Gera código de autenticação para telefone
  async generatePhoneAuthCode(phone: string) {
    const authCode = this.generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutos

    const result = await generateAuthCode(
      { phone, authCode, expiresAt },
      this.userRepository,
    );

    // Envia o código via SMS
    await this.smsService.sendSms(
      phone,
      `Seu código de autenticação Construgame é: ${authCode}`,
    );
    console.log(`📱 Auth code for ${phone}: ${authCode}`);

    return {
      codeGenerated: result.codeGenerated,
      codeReused: result.codeReused,
      // Não retornar o código em produção!
      ...(process.env.NODE_ENV === "development" && { authCode }),
    };
  }

  // Login App (phone + authCode)
  async loginApp(phone: string, authCode: string) {
    try {
      const result = await validateAuthCode(
        { phone, authCode },
        this.userRepository,
      );

      const payload = {
        username: result.user.phone,
        sub: result.user.id,
        roles: result.user.type,
      };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: result.user.id,
          phone: result.user.phone,
          name: result.user.name,
          photo: result.user.photo,
          type: result.user.type,
        },
      };
    } catch (error) {
      throw new UnauthorizedException("Invalid credentials");
    }
  }

  // Inicia recuperação de senha
  async recoverPassword(email: string) {
    const recoveryCode = this.generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutos

    const result = await recoverPassword(
      { email, recoveryCode, expiresAt },
      this.userRepository,
    );

    if (result.codeGenerated && result.user) {
      // Envia o código via email
      await this.emailService.sendRecoverPasswordEmail(
        email,
        result.user.name || "Usuário",
        recoveryCode,
        result.user.id,
      );
      this.logger.log(`Recovery email sent to ${email}`);
    }

    // Sempre retorna sucesso para não revelar se o email existe
    return {
      message: "If the email exists, a recovery code has been sent.",
      // Em desenvolvimento, retornar o código para facilitar testes
      ...(process.env.NODE_ENV === "development" &&
        result.codeGenerated && { recoveryCode }),
    };
  }

  // Altera senha com código de recuperação
  async changePassword(
    userId: string,
    recoveryCode: string,
    newPassword: string,
  ) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    try {
      const result = await changePasswordUseCase(
        { userId, recoveryCode, hashedPassword },
        this.userRepository,
      );

      return {
        message: "Password changed successfully",
        user: {
          id: result.user.id,
          email: result.user.email,
          phone: result.user.phone,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // Gera código aleatório numérico
  private generateRandomCode(length: number): string {
    const digits = "0123456789";
    let code = "";
    const randomBytesBuffer = randomBytes(length);

    for (let i = 0; i < length; i++) {
      code += digits[randomBytesBuffer[i] % 10];
    }

    return code;
  }
}
