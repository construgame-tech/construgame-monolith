// Use Case: Deletar um team

import { ITeamRepository } from "../repositories/team.repository.interface";

export interface DeleteTeamInput {
  organizationId: string;
  teamId: string;
}

export interface DeleteTeamOutput {
  success: boolean;
}

export const deleteTeam = async (
  input: DeleteTeamInput,
  teamRepository: ITeamRepository,
): Promise<DeleteTeamOutput> => {
  // Verifica se o team existe
  const team = await teamRepository.findById(
    input.organizationId,
    input.teamId,
  );

  if (!team) {
    throw new Error(`Team not found: ${input.teamId}`);
  }

  // Deleta do repositório
  await teamRepository.delete(input.organizationId, input.teamId);

  return { success: true };
};
