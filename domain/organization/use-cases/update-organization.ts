// Use Case: Atualizar uma organization existente

import {
  type OrganizationEntity,
  updateOrganizationEntity,
} from "../entities/organization.entity";
import type { IOrganizationRepository } from "../repositories/organization.repository.interface";

export interface UpdateOrganizationInput {
  organizationId: string;
  name?: string;
  photo?: string;
}

export interface UpdateOrganizationOutput {
  organization: OrganizationEntity;
}

export const updateOrganization = async (
  input: UpdateOrganizationInput,
  organizationRepository: IOrganizationRepository,
): Promise<UpdateOrganizationOutput> => {
  // Busca a organization atual
  const currentOrganization = await organizationRepository.findById(
    input.organizationId,
  );

  if (!currentOrganization) {
    throw new Error(`Organization not found: ${input.organizationId}`);
  }

  // Aplica as atualizações na entidade
  const updatedOrganization = updateOrganizationEntity(currentOrganization, {
    name: input.name,
    photo: input.photo,
  });

  // Persiste no repositório
  await organizationRepository.save(updatedOrganization);

  return { organization: updatedOrganization };
};
