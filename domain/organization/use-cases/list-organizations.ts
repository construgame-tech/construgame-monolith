// Use Case: Listar todas as organizations

import { OrganizationEntity } from "../entities/organization.entity";
import { IOrganizationRepository } from "../repositories/organization.repository.interface";

export interface ListOrganizationsInput {}

export interface ListOrganizationsOutput {
  organizations: OrganizationEntity[];
}

export const listOrganizations = async (
  input: ListOrganizationsInput,
  organizationRepository: IOrganizationRepository,
): Promise<ListOrganizationsOutput> => {
  // Busca todas as organizations
  const organizations = await organizationRepository.findAll();

  return { organizations };
};
