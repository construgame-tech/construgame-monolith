// Use Case: Buscar um team por ID

import { TeamEntity } from "../entities/team.entity";
import { ITeamRepository } from "../repositories/team.repository.interface";

export interface GetTeamInput {
  organizationId: string;
  teamId: string;
}

export interface GetTeamOutput {
  team: TeamEntity;
}

export const getTeam = async (
  input: GetTeamInput,
  teamRepository: ITeamRepository,
): Promise<GetTeamOutput> => {
  // Busca o team
  const team = await teamRepository.findById(
    input.organizationId,
    input.teamId,
  );

  if (!team) {
    throw new Error(`Team not found: ${input.teamId}`);
  }

  return { team };
};
