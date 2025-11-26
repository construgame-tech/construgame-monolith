// Use Case: Buscar uma organization por ID

import type { OrganizationEntity } from "../entities/organization.entity";
import type { IOrganizationRepository } from "../repositories/organization.repository.interface";

export interface GetOrganizationInput {
  organizationId: string;
}

export interface GetOrganizationOutput {
  organization: OrganizationEntity;
}

export const getOrganization = async (
  input: GetOrganizationInput,
  organizationRepository: IOrganizationRepository,
): Promise<GetOrganizationOutput> => {
  // Busca a organization
  const organization = await organizationRepository.findById(
    input.organizationId,
  );

  if (!organization) {
    throw new Error(`Organization not found: ${input.organizationId}`);
  }

  return { organization };
};
