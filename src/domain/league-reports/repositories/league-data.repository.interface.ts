// Interface do repositório de Liga para relatórios
// Define o contrato para buscar dados da liga necessários para relatórios

export interface LeagueData {
  id: string;
  organizationId: string;
  projects: string[];
  gameId: string | null;
}

export interface ILeagueDataRepository {
  // Busca dados básicos da liga
  findById(leagueId: string): Promise<LeagueData | null>;

  // Busca IDs de projetos vinculados à liga
  getProjectIds(organizationId: string, leagueId: string): Promise<string[]>;

  // Busca IDs de games dos projetos
  getGameIds(organizationId: string, projectIds: string[]): Promise<string[]>;
}
