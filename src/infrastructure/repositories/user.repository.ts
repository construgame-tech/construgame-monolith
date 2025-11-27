import { UserEntity } from "@domain/user/entities/user.entity";
import { IUserRepository } from "@domain/user/repositories/user.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { users } from "../database/schemas/user.schema";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(user: UserEntity): Promise<void> {
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email || null,
      phone: user.phone || null,
      password: user.password || null,
      authCode: user.authCode || null,
      authCodeExpiresAt: user.authCodeExpiresAt || null,
      signedTermsOfUse: (user.signedTermsOfUse ? 1 : 0) as 0 | 1,
      nickname: user.nickname || null,
      photo: user.photo || null,
      status: user.status,
      passwordRecoveryCode: user.passwordRecoveryCode || null,
      passwordRecoveryCodeExpires: user.passwordRecoveryCodeExpires || null,
      type: user.type || null,
      customId: user.customId || null,
      updatedAt: new Date(),
    };

    // Upsert: insert or update if exists
    await this.db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: userData,
    });
  }

  async delete(user: UserEntity): Promise<void> {
    await this.db.delete(users).where(eq(users.id, user.id));
  }

  async findById(userId: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByPhone(phone: string): Promise<UserEntity | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone))
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async updateAuthCodeOnly(
    userId: string,
    authCode?: string,
    authCodeExpiresAt?: string,
  ): Promise<void> {
    await this.db
      .update(users)
      .set({
        authCode: authCode || null,
        authCodeExpiresAt: authCodeExpiresAt || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  async saveWithoutEvents(user: UserEntity): Promise<void> {
    // In this implementation, saveWithoutEvents is same as save because we don't have event bus hooked up yet
    // But conceptually it should just persist state
    await this.save(user);
  }

  // Helper to map from Drizzle schema to Domain Entity
  private mapToEntity(row: typeof users.$inferSelect): UserEntity {
    return {
      id: row.id,
      name: row.name,
      email: row.email || undefined,
      phone: row.phone || undefined,
      password: row.password || undefined,
      authCode: row.authCode || undefined,
      authCodeExpiresAt: row.authCodeExpiresAt || undefined,
      signedTermsOfUse: row.signedTermsOfUse === 1,
      nickname: row.nickname || undefined,
      photo: row.photo || undefined,
      status: row.status as "WAITING_CONFIRMATION" | "ACTIVE",
      passwordRecoveryCode: row.passwordRecoveryCode || undefined,
      passwordRecoveryCodeExpires: row.passwordRecoveryCodeExpires || undefined,
      type: (row.type as "user" | "superuser") || undefined,
      customId: row.customId || undefined,
    };
  }
}
