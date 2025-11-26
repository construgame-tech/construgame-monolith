// Interface do repositório de JobRole
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { JobRoleEntity } from "../entities/job-role.entity";

export interface IJobRoleRepository {
  // Persiste um job role (create ou update)
  save(jobRole: JobRoleEntity): Promise<void>;

  // Remove um job role
  delete(organizationId: string, jobRoleId: string): Promise<void>;

  // Busca um job role por ID
  findById(
    organizationId: string,
    jobRoleId: string,
  ): Promise<JobRoleEntity | null>;

  // Lista todos os job roles de uma organização
  findByOrganizationId(organizationId: string): Promise<JobRoleEntity[]>;
}
