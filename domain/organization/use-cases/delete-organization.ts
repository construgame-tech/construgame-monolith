// Use Case: Deletar uma organization

import type { IOrganizationRepository } from "../repositories/organization.repository.interface";

export interface DeleteOrganizationInput {
  organizationId: string;
}

export interface DeleteOrganizationOutput {
  success: boolean;
}

export const deleteOrganization = async (
  input: DeleteOrganizationInput,
  organizationRepository: IOrganizationRepository,
): Promise<DeleteOrganizationOutput> => {
  // Verifica se a organization existe
  const organization = await organizationRepository.findById(
    input.organizationId,
  );

  if (!organization) {
    throw new Error(`Organization not found: ${input.organizationId}`);
  }

  // Deleta do repositório
  await organizationRepository.delete(input.organizationId);

  return { success: true };
};
