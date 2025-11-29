// Use Case: Listar todos os teams de uma organização

import { TeamWithDetails } from "../entities/team.entity";
import { ITeamRepository } from "../repositories/team.repository.interface";

export interface ListOrganizationTeamsInput {
  organizationId: string;
}

export interface ListOrganizationTeamsOutput {
  teams: TeamWithDetails[];
}

export const listOrganizationTeams = async (
  input: ListOrganizationTeamsInput,
  teamRepository: ITeamRepository,
): Promise<ListOrganizationTeamsOutput> => {
  // Busca todos os teams da organização com detalhes dos membros
  const teams = await teamRepository.findByOrganizationIdWithDetails(
    input.organizationId,
  );

  return { teams };
};
