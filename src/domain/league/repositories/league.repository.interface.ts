// Interface do repositório de League
// Define o contrato para persistência, sem implementação

import { LeagueEntity } from "../entities/league.entity";

export interface ILeagueRepository {
  // Persiste uma league (create ou update)
  save(league: LeagueEntity): Promise<void>;

  // Remove uma league
  delete(organizationId: string, leagueId: string): Promise<void>;

  // Busca uma league por ID (requer organizationId)
  findById(
    organizationId: string,
    leagueId: string,
  ): Promise<LeagueEntity | null>;

  // Busca uma league apenas pelo ID (sem organizationId)
  findByIdOnly(leagueId: string): Promise<LeagueEntity | null>;

  // Lista todas as leagues de uma organização
  findByOrganizationId(organizationId: string): Promise<LeagueEntity[]>;
}
