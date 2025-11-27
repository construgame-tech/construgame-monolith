import type { DrizzleDB } from "@infrastructure/database/drizzle.provider";
import { DRIZZLE_CONNECTION } from "@infrastructure/database/drizzle.provider";
import { organizations } from "@infrastructure/database/schemas/organization.schema";
import { users } from "@infrastructure/database/schemas/user.schema";
import { Inject, Injectable } from "@nestjs/common";
import { ilike, or } from "drizzle-orm";

@Injectable()
export class SearchService {
  constructor(
    @Inject(DRIZZLE_CONNECTION)
    private readonly db: DrizzleDB,
  ) {}

  /**
   * Busca usuários pelo nome ou nickname
   */
  async searchUsers(
    query: string,
  ): Promise<
    { id: string; name: string; nickname?: string; photo?: string }[]
  > {
    const searchPattern = `%${query}%`;

    const results = await this.db
      .select({
        id: users.id,
        name: users.name,
        nickname: users.nickname,
        photo: users.photo,
      })
      .from(users)
      .where(
        or(
          ilike(users.name, searchPattern),
          ilike(users.nickname, searchPattern),
          ilike(users.email, searchPattern),
        ),
      )
      .limit(50);

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      nickname: row.nickname || undefined,
      photo: row.photo || undefined,
    }));
  }

  /**
   * Busca organizações pelo nome
   */
  async searchOrganizations(
    query: string,
  ): Promise<{ id: string; name: string; photo?: string }[]> {
    const searchPattern = `%${query}%`;

    const results = await this.db
      .select({
        id: organizations.id,
        name: organizations.name,
        photo: organizations.photo,
      })
      .from(organizations)
      .where(ilike(organizations.name, searchPattern))
      .limit(50);

    return results.map((row) => ({
      id: row.id,
      name: row.name,
      photo: row.photo || undefined,
    }));
  }
}
