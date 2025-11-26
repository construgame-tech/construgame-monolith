// Helper: Obter timestamp atual
// Retorna a data e hora atual em formato ISO string

export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};
