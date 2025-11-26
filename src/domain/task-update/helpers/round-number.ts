// Helper: Arredondar número
// Arredonda um número com precisão de duas casas decimais

export const roundNumber = (number: number): number => {
  return Math.round((number + Number.EPSILON) * 100) / 100;
};
