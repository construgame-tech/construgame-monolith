import {
  MemberEntity,
  MemberWithUser,
} from "@domain/member/entities/member.entity";
import { IMemberRepository } from "@domain/member/repositories/member.repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import { and, eq } from "drizzle-orm";
import type { DrizzleDB } from "../database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { members } from "../database/schemas/member.schema";
import { users } from "../database/schemas/user.schema";

@Injectable()
export class MemberRepository implements IMemberRepository {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  async save(member: MemberEntity): Promise<void> {
    const memberData = {
      userId: member.userId,
      organizationId: member.organizationId,
      role: member.role,
      sectorId: member.sectorId || null,
      sector: member.sector || null,
      position: member.position || null,
      jobRoleId: member.jobRoleId || null,
      jobRoleVariantId: member.jobRoleVariantId || null,
      salary: member.salary || null,
      seniority: member.seniority || null,
      state: member.state || null,
      hoursPerDay: member.hoursPerDay || null,
    };

    // Upsert: insert or update if exists
    await this.db
      .insert(members)
      .values(memberData)
      .onConflictDoUpdate({
        target: [members.userId, members.organizationId],
        set: memberData,
      });
  }

  async delete(userId: string, organizationId: string): Promise<void> {
    await this.db
      .delete(members)
      .where(
        and(
          eq(members.userId, userId),
          eq(members.organizationId, organizationId),
        ),
      );
  }

  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<MemberEntity | null> {
    const result = await this.db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, userId),
          eq(members.organizationId, organizationId),
        ),
      )
      .limit(1);

    if (!result.length) {
      return null;
    }

    return this.mapToEntity(result[0]);
  }

  async findByOrganizationId(organizationId: string): Promise<MemberEntity[]> {
    const result = await this.db
      .select()
      .from(members)
      .where(eq(members.organizationId, organizationId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByUserId(userId: string): Promise<MemberEntity[]> {
    const result = await this.db
      .select()
      .from(members)
      .where(eq(members.userId, userId));

    return result.map((row) => this.mapToEntity(row));
  }

  async findByOrganizationIdWithUserData(
    organizationId: string,
  ): Promise<MemberWithUser[]> {
    const result = await this.db
      .select({
        // Member fields
        userId: members.userId,
        organizationId: members.organizationId,
        role: members.role,
        sectorId: members.sectorId,
        sector: members.sector,
        position: members.position,
        jobRoleId: members.jobRoleId,
        jobRoleVariantId: members.jobRoleVariantId,
        salary: members.salary,
        seniority: members.seniority,
        state: members.state,
        hoursPerDay: members.hoursPerDay,
        // User fields
        name: users.name,
        nickname: users.nickname,
        phone: users.phone,
        email: users.email,
        photo: users.photo,
        status: users.status,
        customId: users.customId,
      })
      .from(members)
      .innerJoin(users, eq(members.userId, users.id))
      .where(eq(members.organizationId, organizationId));

    return result.map((row) => ({
      userId: row.userId,
      organizationId: row.organizationId,
      role: row.role,
      sectorId: row.sectorId || undefined,
      sector: row.sector || undefined,
      position: row.position || undefined,
      jobRoleId: row.jobRoleId || undefined,
      jobRoleVariantId: row.jobRoleVariantId || undefined,
      salary: row.salary || undefined,
      seniority: row.seniority || undefined,
      state: row.state || undefined,
      hoursPerDay: row.hoursPerDay || undefined,
      name: row.name || undefined,
      nickname: row.nickname || undefined,
      phone: row.phone || undefined,
      email: row.email || undefined,
      photo: row.photo || undefined,
      status: row.status || undefined,
      customId: row.customId || undefined,
    }));
  }

  private mapToEntity(row: typeof members.$inferSelect): MemberEntity {
    return {
      userId: row.userId,
      organizationId: row.organizationId,
      role: row.role,
      sectorId: row.sectorId || undefined,
      sector: row.sector || undefined,
      position: row.position || undefined,
      jobRoleId: row.jobRoleId || undefined,
      jobRoleVariantId: row.jobRoleVariantId || undefined,
      salary: row.salary || undefined,
      seniority: row.seniority || undefined,
      state: row.state || undefined,
      hoursPerDay: row.hoursPerDay || undefined,
    };
  }
}
