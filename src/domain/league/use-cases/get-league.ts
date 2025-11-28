// Use Case: Buscar uma league por ID
import type { LeagueEntity } from "../entities/league.entity";
import type { ILeagueRepository } from "../repositories/league.repository.interface";

export interface GetLeagueInput {
  organizationId: string;
  leagueId: string;
}

export interface GetLeagueOutput {
  league: LeagueEntity;
}

export const getLeague = async (
  input: GetLeagueInput,
  repository: ILeagueRepository,
): Promise<GetLeagueOutput> => {
  const league = await repository.findById(
    input.organizationId,
    input.leagueId,
  );

  if (!league) {
    throw new Error(`League not found: ${input.leagueId}`);
  }

  return { league };
};
