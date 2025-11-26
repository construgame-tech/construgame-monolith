// Helper: Calcular percentual de progresso
// Calcula o percentual de progresso baseado no valor atual e esperado

export const calculateProgressPercent = (
  current?: number,
  expected?: string,
): number | undefined => {
  if (expected && current) {
    return Math.floor((current / parseInt(expected, 10)) * 100);
  }
};
