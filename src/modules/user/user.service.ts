import {
  activateUser,
  CreateUserInput,
  createUser,
  deleteUser,
  getUser,
  getUserByEmail,
  getUserByPhone,
  makeSuperuser,
  updateUser,
} from "@domain/user";
import { UserEntity } from "@domain/user/entities/user.entity";
import { UserRepository } from "@infrastructure/repositories/user.repository";
import { EmailService } from "@infrastructure/services/email/email.service";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Gera um código aleatório de 6 dígitos
   */
  private generateRandomCode(length: number): string {
    const digits = "0123456789";
    let code = "";
    for (let i = 0; i < length; i++) {
      code += digits[Math.floor(Math.random() * digits.length)];
    }
    return code;
  }

  /**
   * Cria um novo usuário e envia email de boas-vindas
   */
  async create(input: CreateUserInput): Promise<{ user: UserEntity }> {
    // Gera código de recuperação para o novo usuário criar sua senha
    const recoveryCode = this.generateRandomCode(6);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Cria o usuário com o código de recuperação
    const result = await createUser(
      {
        ...input,
        passwordRecoveryCode: recoveryCode,
      },
      this.userRepository,
    );

    // Atualiza a data de expiração do código
    if (result.user.id && input.email) {
      await this.userRepository.save({
        ...result.user,
        passwordRecoveryCodeExpires: expiresAt.toISOString(),
      });

      // Envia email de boas-vindas apenas se o usuário tem email
      try {
        await this.emailService.sendWelcomeEmail(
          input.email,
          result.user.name || "Usuário",
          recoveryCode,
          result.user.id,
        );
        this.logger.log(`Welcome email sent to ${input.email}`);
      } catch (error) {
        this.logger.error(
          `Failed to send welcome email to ${input.email}:`,
          error,
        );
        // Não falha a criação do usuário se o email não for enviado
      }
    }

    return result;
  }

  /**
   * Busca um usuário por ID
   */
  async findById(userId: string): Promise<{ user: UserEntity }> {
    return await getUser({ userId }, this.userRepository);
  }

  /**
   * Atualiza um usuário
   */
  async update(
    userId: string,
    input: Partial<CreateUserInput>,
  ): Promise<{ user: UserEntity }> {
    return await updateUser({ userId, ...input }, this.userRepository);
  }

  /**
   * Remove um usuário
   */
  async delete(userId: string): Promise<void> {
    await deleteUser({ userId }, this.userRepository);
  }

  /**
   * Ativa um usuário
   */
  async activate(userId: string): Promise<{ user: UserEntity }> {
    return await activateUser({ userId }, this.userRepository);
  }

  /**
   * Promove um usuário para superuser
   */
  async makeSuperuser(userId: string): Promise<{ user: UserEntity }> {
    return await makeSuperuser({ userId }, this.userRepository);
  }

  /**
   * Busca um usuário por email
   */
  async findByEmail(email: string): Promise<{ user: UserEntity | null }> {
    return await getUserByEmail({ email }, this.userRepository);
  }

  /**
   * Busca um usuário por telefone
   */
  async findByPhone(phone: string): Promise<{ user: UserEntity | null }> {
    return await getUserByPhone({ phone }, this.userRepository);
  }
}
