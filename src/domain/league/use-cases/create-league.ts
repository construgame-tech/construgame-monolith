// Use Case: Criar uma nova league
import { randomUUID } from "node:crypto";
import { createLeagueEntity, LeagueEntity, LeaguePrize } from "../entities/league.entity";
import type { ILeagueRepository } from "../repositories/league.repository.interface";

export interface CreateLeagueInput {
  organizationId: string;
  responsibleId: string;
  name: string;
  photo?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  prizes?: LeaguePrize[];
  projects?: string[];
  games?: string[];
  hidden?: boolean;
}

export interface CreateLeagueOutput {
  league: LeagueEntity;
}

export const createLeague = async (
  input: CreateLeagueInput,
  repository: ILeagueRepository,
): Promise<CreateLeagueOutput> => {
  const league = createLeagueEntity({
    id: randomUUID(),
    organizationId: input.organizationId,
    responsibleId: input.responsibleId,
    name: input.name,
    photo: input.photo,
    objective: input.objective,
    startDate: input.startDate,
    endDate: input.endDate,
    prizes: input.prizes,
    projects: input.projects,
    games: input.games,
    hidden: input.hidden,
  });

  await repository.save(league);

  return { league };
};
