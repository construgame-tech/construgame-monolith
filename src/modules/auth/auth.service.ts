import { randomBytes, randomUUID } from "node:crypto";
import { UserEntity } from "@domain/user/entities/user.entity";
import { authenticateWithEmail } from "@domain/user/use-cases/authenticate-with-email";
import {
  generateAuthCode,
  validateAuthCode,
} from "@domain/user/use-cases/authenticate-with-phone";
import { changePassword as changePasswordUseCase } from "@domain/user/use-cases/change-password";
import { recoverPassword } from "@domain/user/use-cases/recover-password";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
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

export interface UserRole {
  organizationId: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberRepository,
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
    } catch (_error) {
      return null;
    }
  }

  // Login Web (email + password)
  async loginWeb(user: UserEntity) {
    // Buscar roles do usuário (memberships em organizações)
    const members = await this.memberRepository.findByUserId(user.id);
    const roles: UserRole[] = members.map((member) => ({
      organizationId: member.organizationId,
      role: member.role,
    }));

    // Payload do access token
    const accessTokenPayload = {
      type: "accessToken",
      roles,
      userType: user.type,
      aud: "web",
      sub: user.id,
    };

    // Payload do refresh token
    const refreshTokenPayload = {
      type: "refreshToken",
      aud: "web",
      sub: user.id,
      jti: randomUUID(), // Identificador único para o refresh token
    };

    // Gerar tokens
    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: "30m", // 30 minutos
    });

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: "30d", // 30 dias
    });

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      roles,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        nickname: user.nickname,
        signedTermsOfUse: user.signedTermsOfUse ?? false,
        photo: user.photo,
        status: user.status,
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

      const user = result.user;

      // Buscar roles do usuário (memberships em organizações)
      const members = await this.memberRepository.findByUserId(user.id);
      const roles: UserRole[] = members.map((member) => ({
        organizationId: member.organizationId,
        role: member.role,
      }));

      // Payload do access token
      const accessTokenPayload = {
        type: "accessToken",
        roles,
        userType: user.type,
        aud: "app",
        sub: user.id,
      };

      // Payload do refresh token
      const refreshTokenPayload = {
        type: "refreshToken",
        aud: "app",
        sub: user.id,
        jti: randomUUID(),
      };

      // Gerar tokens
      const accessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: "30m",
      });

      const refreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: "30d",
      });

      return {
        accessToken,
        refreshToken,
        userId: user.id,
        roles,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          nickname: user.nickname,
          signedTermsOfUse: user.signedTermsOfUse ?? false,
          photo: user.photo,
          status: user.status,
        },
      };
    } catch (_error) {
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

  // Valida código de recuperação (sem alterar senha)
  async validateRecoveryCode(userId: string, recoveryCode: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new BadRequestException("User not found");
    }

    if (user.passwordRecoveryCode !== recoveryCode) {
      throw new BadRequestException("Invalid recovery code");
    }

    if (user.passwordRecoveryCodeExpires) {
      const expiresAt = new Date(user.passwordRecoveryCodeExpires);
      if (expiresAt < new Date()) {
        throw new BadRequestException("Recovery code expired");
      }
    }

    return {
      valid: true,
      userId: user.id,
    };
  }

  // Recuperação de senha pelo admin (retorna o link ao invés de enviar email)
  async adminRecoverPassword(email: string) {
    const recoveryCode = this.generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 horas

    const result = await recoverPassword(
      { email, recoveryCode, expiresAt },
      this.userRepository,
    );

    if (!result.codeGenerated || !result.user) {
      throw new BadRequestException("User not found");
    }

    const appUrl = process.env.APP_URL || "https://app.construgame.com.br";
    const recoveryLink = `${appUrl}/nova-senha?code=${recoveryCode}&userId=${result.user.id}&email=${encodeURIComponent(email)}`;

    return {
      recoveryLink,
      userId: result.user.id,
      expiresAt,
    };
  }

  // Refresh token Web
  async refreshWebToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== "refreshToken" || payload.aud !== "web") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Buscar roles do usuário
      const members = await this.memberRepository.findByUserId(user.id);
      const roles: UserRole[] = members.map((member) => ({
        organizationId: member.organizationId,
        role: member.role,
      }));

      // Gerar novos tokens
      const accessTokenPayload = {
        type: "accessToken",
        roles,
        userType: user.type,
        aud: "web",
        sub: user.id,
      };

      const refreshTokenPayload = {
        type: "refreshToken",
        aud: "web",
        sub: user.id,
        jti: randomUUID(),
      };

      const newAccessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: "30m",
      });

      const newRefreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: "30d",
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userId: user.id,
        roles,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  // Refresh token App
  async refreshAppToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);

      if (payload.type !== "refreshToken" || payload.aud !== "app") {
        throw new UnauthorizedException("Invalid refresh token");
      }

      const user = await this.userRepository.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException("User not found");
      }

      // Buscar roles do usuário
      const members = await this.memberRepository.findByUserId(user.id);
      const roles: UserRole[] = members.map((member) => ({
        organizationId: member.organizationId,
        role: member.role,
      }));

      // Gerar novos tokens
      const accessTokenPayload = {
        type: "accessToken",
        roles,
        userType: user.type,
        aud: "app",
        sub: user.id,
      };

      const refreshTokenPayload = {
        type: "refreshToken",
        aud: "app",
        sub: user.id,
        jti: randomUUID(),
      };

      const newAccessToken = this.jwtService.sign(accessTokenPayload, {
        expiresIn: "30m",
      });

      const newRefreshToken = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: "30d",
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        userId: user.id,
        roles,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException("Invalid or expired refresh token");
    }
  }

  // SSO Microsoft (stub - implementação futura)
  async ssoMicrosoft(code: string) {
    // TODO: Implementar integração real com Microsoft SSO
    // Por enquanto, retorna erro indicando que não está implementado
    this.logger.warn(
      `SSO Microsoft login attempted with code: ${code.substring(0, 10)}...`,
    );
    throw new BadRequestException(
      "Microsoft SSO is not yet implemented. Please use email/password login.",
    );
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
