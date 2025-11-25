// Use Case: Criar um novo team

import { randomUUID } from "node:crypto";
import { createTeamEntity, TeamEntity } from "../entities/team.entity";
import { ITeamRepository } from "../repositories/team.repository.interface";

export interface CreateTeamInput {
  organizationId: string;
  name: string;
  managerId?: string;
  fieldOfAction?: string;
  members?: string[];
  photo?: string;
  color?: string;
  description?: string;
}

export interface CreateTeamOutput {
  team: TeamEntity;
}

export const createTeam = async (
  input: CreateTeamInput,
  teamRepository: ITeamRepository,
): Promise<CreateTeamOutput> => {
  // Gera um ID único para o novo team
  const teamId = randomUUID();

  // Cria a entidade de domínio
  const team = createTeamEntity({
    id: teamId,
    organizationId: input.organizationId,
    name: input.name,
    managerId: input.managerId,
    fieldOfAction: input.fieldOfAction,
    members: input.members,
    photo: input.photo,
    color: input.color,
    description: input.description,
  });

  // Persiste no repositório
  await teamRepository.save(team);

  return { team };
};
