// Use Case: Atualizar um team existente

import { TeamEntity, updateTeamEntity } from "../entities/team.entity";
import { ITeamRepository } from "../repositories/team.repository.interface";

export interface UpdateTeamInput {
  organizationId: string;
  teamId: string;
  name?: string;
  managerId?: string;
  fieldOfAction?: string;
  members?: string[];
  photo?: string;
  color?: string;
  description?: string;
}

export interface UpdateTeamOutput {
  team: TeamEntity;
}

export const updateTeam = async (
  input: UpdateTeamInput,
  teamRepository: ITeamRepository,
): Promise<UpdateTeamOutput> => {
  // Busca o team atual
  const currentTeam = await teamRepository.findById(
    input.organizationId,
    input.teamId,
  );

  if (!currentTeam) {
    throw new Error(`Team not found: ${input.teamId}`);
  }

  // Aplica as atualizações na entidade
  const updatedTeam = updateTeamEntity(currentTeam, {
    name: input.name,
    managerId: input.managerId,
    fieldOfAction: input.fieldOfAction,
    members: input.members,
    photo: input.photo,
    color: input.color,
    description: input.description,
  });

  // Persiste no repositório
  await teamRepository.save(updatedTeam);

  return { team: updatedTeam };
};
