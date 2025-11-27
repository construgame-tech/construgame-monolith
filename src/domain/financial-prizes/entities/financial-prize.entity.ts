// Entidade de domínio: Financial Prize
// Representa um prêmio financeiro calculado baseado em custos laborais

export interface FinancialPrizeEntity {
  id: string;
  organizationId: string;
  projectId: string;
  gameId: string;
  userId: string;
  amount: number; // Valor do prêmio calculado
  period: string; // Período de referência (YYYY-MM)
  calculatedAt: string;
  details?: {
    laborCost?: number;
    kpiMultiplier?: number;
    taskPoints?: number;
    kaizenPoints?: number;
  };
}

export const createFinancialPrizeEntity = (
  props: Omit<FinancialPrizeEntity, "calculatedAt">,
): FinancialPrizeEntity => {
  return {
    ...props,
    calculatedAt: new Date().toISOString(),
  };
};
