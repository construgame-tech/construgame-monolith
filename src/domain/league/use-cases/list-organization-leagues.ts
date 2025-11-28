// Use Case: Listar leagues de uma organização
import type { LeagueEntity } from "../entities/league.entity";
import type { ILeagueRepository } from "../repositories/league.repository.interface";

export interface ListOrganizationLeaguesInput {
  organizationId: string;
}

export interface ListOrganizationLeaguesOutput {
  leagues: LeagueEntity[];
}

export const listOrganizationLeagues = async (
  input: ListOrganizationLeaguesInput,
  repository: ILeagueRepository,
): Promise<ListOrganizationLeaguesOutput> => {
  const leagues = await repository.findByOrganizationId(input.organizationId);

  return { leagues };
};
