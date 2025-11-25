// Use Case: Criar uma nova organization

import { randomUUID } from "crypto";
import {
  createOrganizationEntity,
  OrganizationEntity,
} from "../entities/organization.entity";
import { IOrganizationRepository } from "../repositories/organization.repository.interface";

export interface CreateOrganizationInput {
  ownerId: string;
  name: string;
  photo?: string;
}

export interface CreateOrganizationOutput {
  organization: OrganizationEntity;
}

export const createOrganization = async (
  input: CreateOrganizationInput,
  organizationRepository: IOrganizationRepository,
): Promise<CreateOrganizationOutput> => {
  // Gera um ID único para a nova organization
  const organizationId = randomUUID();

  // Cria a entidade de domínio
  const organization = createOrganizationEntity({
    id: organizationId,
    ownerId: input.ownerId,
    name: input.name,
    photo: input.photo,
  });

  // Persiste no repositório
  await organizationRepository.save(organization);

  return { organization };
};
