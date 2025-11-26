// Use Case: Listar todos os teams de uma organização

import { TeamEntity } from "../entities/team.entity";
import { ITeamRepository } from "../repositories/team.repository.interface";

export interface ListOrganizationTeamsInput {
  organizationId: string;
}

export interface ListOrganizationTeamsOutput {
  teams: TeamEntity[];
}

export const listOrganizationTeams = async (
  input: ListOrganizationTeamsInput,
  teamRepository: ITeamRepository,
): Promise<ListOrganizationTeamsOutput> => {
  // Busca todos os teams da organização
  const teams = await teamRepository.findByOrganizationId(input.organizationId);

  return { teams };
};
