// Interface do repositório de Project
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { ProjectEntity } from "../entities/project.entity";

export interface IProjectRepository {
  // Persiste um project (create ou update)
  save(project: ProjectEntity): Promise<void>;

  // Remove um project
  delete(organizationId: string, projectId: string): Promise<void>;

  // Busca um project por ID
  findById(
    organizationId: string,
    projectId: string,
  ): Promise<ProjectEntity | null>;

  // Lista todos os projects de uma organização
  findByOrganizationId(organizationId: string): Promise<ProjectEntity[]>;
}
