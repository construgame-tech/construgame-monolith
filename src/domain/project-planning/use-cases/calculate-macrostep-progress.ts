/**
 * Use Case: Calcular Progresso da Macroetapa
 *
 * Calcula o progresso percentual de uma macroetapa baseado na média
 * ponderada do progresso de suas atividades.
 *
 * Fórmula: Σ(activity.progressPercent) / quantidade de activities
 */

export interface ActivityProgressData {
  progressPercent?: number | null | undefined;
}

export interface CalculateMacrostepProgressInput {
  activities: ActivityProgressData[];
}

export interface CalculateMacrostepProgressOutput {
  progressPercent: number;
}

/**
 * Calcula o progresso percentual de uma macroetapa.
 *
 * @param input - Lista de atividades com seus progressos
 * @returns Progresso em percentual (0-100)
 */
export const calculateMacrostepProgress = (
  input: CalculateMacrostepProgressInput,
): CalculateMacrostepProgressOutput => {
  const { activities } = input;

  // Se não há atividades, retorna 0%
  if (!activities || activities.length === 0) {
    return { progressPercent: 0 };
  }

  // Soma o progresso de todas as atividades
  const totalProgress = activities.reduce(
    (sum, activity) => sum + (activity.progressPercent || 0),
    0,
  );

  // Calcula a média
  const averageProgress = totalProgress / activities.length;

  // Arredonda para 2 casas decimais
  return {
    progressPercent: Math.round(averageProgress * 100) / 100,
  };
};
