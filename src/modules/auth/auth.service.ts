import { randomUUID } from "node:crypto";
import { generateRandomCode } from "@common/helpers/code-generator";
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
import { SsmService } from "@infrastructure/services/ssm/ssm.service";
import { WhatsAppService } from "@infrastructure/services/whatsapp/whatsapp.service";
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import * as jsonwebtoken from "jsonwebtoken";

export interface UserRole {
  organizationId: string;
  role: string;
}

// Constantes para conta de teste da Play Store
const PLAY_STORE_TESTER_PHONE = "+5512999999999";
const PLAY_STORE_TESTER_CODE = "7381";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly playStoreTesterPhone: string;
  private readonly playStoreTesterCode: string;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly memberRepository: MemberRepository,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly whatsAppService: WhatsAppService,
    private readonly ssmService: SsmService,
    private readonly configService: ConfigService,
  ) {
    this.playStoreTesterPhone =
      this.configService.get<string>("PLAY_STORE_TESTER_PHONE") ||
      PLAY_STORE_TESTER_PHONE;
    this.playStoreTesterCode =
      this.configService.get<string>("PLAY_STORE_TESTER_CODE") ||
      PLAY_STORE_TESTER_CODE;
  }

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

    // Buscar o JWT secret do SSM (em produção) ou do env (em dev)
    const jwtSecret = await this.ssmService.getJwtSecret();

    // Payload do access token
    const accessTokenPayload = {
      type: "accessToken",
      roles,
      userType: user.type,
    };

    // Payload do refresh token
    const refreshTokenPayload = {
      type: "refreshToken",
      jti: randomUUID(), // Identificador único para o refresh token
    };

    // Gerar tokens usando jsonwebtoken diretamente com o secret do SSM
    const accessToken = jsonwebtoken.sign(accessTokenPayload, jwtSecret, {
      audience: "web",
      subject: user.id,
      expiresIn: "30m", // 30 minutos
    });

    const refreshToken = jsonwebtoken.sign(refreshTokenPayload, jwtSecret, {
      audience: "web",
      subject: user.id,
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

  /**
   * Gera código de autenticação para telefone e envia via SMS e WhatsApp.
   * Para a conta de teste da Play Store, usa código fixo e não envia mensagens.
   * @param phone Número de telefone no formato +5511999999999
   * @param userName Nome do usuário (opcional, para personalizar mensagem)
   * @param otpHash Hash para SMS Retriever API do Android (opcional)
   */
  async generatePhoneAuthCode(
    phone: string,
    userName?: string,
    otpHash?: string,
  ) {
    // Conta de teste da Play Store: código fixo, não envia mensagem
    const isPlayStoreTester = phone === this.playStoreTesterPhone;
    const authCode = isPlayStoreTester
      ? this.playStoreTesterCode
      : generateRandomCode(4); // Código de 4 dígitos como na API original

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hora (como na API original)

    const result = await generateAuthCode(
      { phone, authCode, expiresAt },
      this.userRepository,
    );

    // Não envia mensagem para conta de teste da Play Store
    if (!isPlayStoreTester) {
      const name = userName || "usuário";
      const otpSuffix = otpHash ? `\n\n${otpHash}` : "";
      const smsMessage = `Olá ${name}! O seu codigo de login é: ${authCode}${otpSuffix}`;

      // Envia SMS e WhatsApp em paralelo
      await Promise.all([
        this.smsService
          .sendSms(phone, smsMessage)
          .catch((err) =>
            this.logger.error(`Falha ao enviar SMS: ${err.message}`),
          ),
        this.whatsAppService
          .sendAuthCode(phone, name, authCode)
          .catch((err) =>
            this.logger.error(`Falha ao enviar WhatsApp: ${err.message}`),
          ),
      ]);
    }

    this.logger.log(`📱 Auth code for ${phone}: ${authCode}`);

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

      // Buscar o JWT secret do SSM (em produção) ou do env (em dev)
      const jwtSecret = await this.ssmService.getJwtSecret();

      // Payload do access token
      const accessTokenPayload = {
        type: "accessToken",
        roles,
        userType: user.type,
      };

      // Payload do refresh token
      const refreshTokenPayload = {
        type: "refreshToken",
        jti: randomUUID(),
      };

      // Gerar tokens usando jsonwebtoken diretamente com o secret do SSM
      const accessToken = jsonwebtoken.sign(accessTokenPayload, jwtSecret, {
        audience: "app",
        subject: user.id,
        expiresIn: "30m",
      });

      const refreshToken = jsonwebtoken.sign(refreshTokenPayload, jwtSecret, {
        audience: "app",
        subject: user.id,
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
    const recoveryCode = generateRandomCode(6);
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
    const recoveryCode = generateRandomCode(6);
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
      // Buscar o JWT secret do SSM
      const jwtSecret = await this.ssmService.getJwtSecret();

      const payload = jsonwebtoken.verify(refreshToken, jwtSecret) as {
        type: string;
        aud: string;
        sub: string;
      };

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
      };

      const refreshTokenPayload = {
        type: "refreshToken",
        jti: randomUUID(),
      };

      const newAccessToken = jsonwebtoken.sign(accessTokenPayload, jwtSecret, {
        audience: "web",
        subject: user.id,
        expiresIn: "30m",
      });

      const newRefreshToken = jsonwebtoken.sign(
        refreshTokenPayload,
        jwtSecret,
        {
          audience: "web",
          subject: user.id,
          expiresIn: "30d",
        },
      );

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
      // Buscar o JWT secret do SSM
      const jwtSecret = await this.ssmService.getJwtSecret();

      const payload = jsonwebtoken.verify(refreshToken, jwtSecret) as {
        type: string;
        aud: string;
        sub: string;
      };

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
      };

      const refreshTokenPayload = {
        type: "refreshToken",
        jti: randomUUID(),
      };

      const newAccessToken = jsonwebtoken.sign(accessTokenPayload, jwtSecret, {
        audience: "app",
        subject: user.id,
        expiresIn: "30m",
      });

      const newRefreshToken = jsonwebtoken.sign(
        refreshTokenPayload,
        jwtSecret,
        {
          audience: "app",
          subject: user.id,
          expiresIn: "30d",
        },
      );

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
}
