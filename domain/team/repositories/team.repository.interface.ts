// Interface do repositório de Team
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { TeamEntity } from "../entities/team.entity";

export interface ITeamRepository {
  // Persiste um team (create ou update)
  save(team: TeamEntity): Promise<void>;

  // Remove um team
  delete(organizationId: string, teamId: string): Promise<void>;

  // Busca um team por ID
  findById(organizationId: string, teamId: string): Promise<TeamEntity | null>;

  // Lista todos os teams de uma organização
  findByOrganizationId(organizationId: string): Promise<TeamEntity[]>;
}
