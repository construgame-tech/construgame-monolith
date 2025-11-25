// Interface do repositório de Organization
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { OrganizationEntity } from "../entities/organization.entity";

export interface IOrganizationRepository {
  // Persiste uma organization (create ou update)
  save(organization: OrganizationEntity): Promise<void>;

  // Remove uma organization
  delete(organizationId: string): Promise<void>;

  // Busca uma organization por ID
  findById(organizationId: string): Promise<OrganizationEntity | null>;

  // Lista todas as organizations
  findAll(): Promise<OrganizationEntity[]>;
}
