// Interface do repositório de Kaizen
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { KaizenEntity } from "../entities/kaizen.entity";

export interface IKaizenRepository {
  // Persiste um kaizen (create ou update)
  save(kaizen: KaizenEntity): Promise<void>;

  // Persiste múltiplos kaizens em uma transação (útil para replicação)
  saveMultiple(kaizens: KaizenEntity[]): Promise<void>;

  // Remove um kaizen
  delete(kaizenId: string): Promise<void>;

  // Busca um kaizen por ID
  findById(kaizenId: string): Promise<KaizenEntity | null>;

  // Busca múltiplos kaizens por IDs (batch get)
  findByIds(kaizenIds: string[]): Promise<KaizenEntity[]>;

  // Lista todos os kaizens de um game
  findByGameId(gameId: string): Promise<KaizenEntity[]>;

  // Lista kaizens por líder
  findByLeaderId(leaderId: string): Promise<KaizenEntity[]>;

  // Lista kaizens por time
  findByTeamId(teamId: string): Promise<KaizenEntity[]>;

  // Lista kaizens de uma organização
  findByOrganizationId(organizationId: string): Promise<KaizenEntity[]>;

  // Lista kaizens de um projeto
  findByProjectId(
    organizationId: string,
    projectId: string,
  ): Promise<KaizenEntity[]>;
}
