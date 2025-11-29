// Use Case: Atualizar uma league existente
import {
  LeagueEntity,
  LeaguePrize,
  LeagueStatus,
  updateLeagueEntity,
} from "../entities/league.entity";
import type { ILeagueRepository } from "../repositories/league.repository.interface";

export interface UpdateLeagueInput {
  organizationId: string;
  leagueId: string;
  responsibleId?: string;
  status?: LeagueStatus;
  name?: string;
  photo?: string;
  objective?: string;
  startDate?: string;
  endDate?: string;
  prizes?: LeaguePrize[];
  projects?: string[];
  games?: string[];
  hidden?: boolean;
}

export interface UpdateLeagueOutput {
  league: LeagueEntity;
}

export const updateLeague = async (
  input: UpdateLeagueInput,
  repository: ILeagueRepository,
): Promise<UpdateLeagueOutput> => {
  const currentLeague = await repository.findById(
    input.organizationId,
    input.leagueId,
  );

  if (!currentLeague) {
    throw new Error(`League not found: ${input.leagueId}`);
  }

  // Garantir que organizationId seja preenchido (fix para dados legados com organizationId vazio)
  const leagueWithOrganization: LeagueEntity = {
    ...currentLeague,
    organizationId: currentLeague.organizationId || input.organizationId,
  };

  const updatedLeague = updateLeagueEntity(leagueWithOrganization, {
    responsibleId: input.responsibleId,
    status: input.status,
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

  await repository.save(updatedLeague);

  return { league: updatedLeague };
};
