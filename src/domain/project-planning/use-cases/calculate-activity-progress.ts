/**
 * Use Case: Calcular Progresso da Atividade
 *
 * Calcula o progresso percentual de uma atividade baseado no progressAbsolute
 * das tasks (TaskManagers) associadas a ela.
 *
 * Fórmula: (Σ tasks.progressAbsolute / totalMeasurementExpected) * 100
 */

export interface TaskProgressData {
  progressAbsolute: number;
}

export interface CalculateActivityProgressInput {
  totalMeasurementExpected: number | null | undefined;
  tasks: TaskProgressData[];
}

export interface CalculateActivityProgressOutput {
  progressPercent: number;
}

/**
 * Calcula o progresso percentual de uma atividade.
 *
 * @param input - Dados da atividade e suas tasks
 * @returns Progresso em percentual (0-100)
 */
export const calculateActivityProgress = (
  input: CalculateActivityProgressInput,
): CalculateActivityProgressOutput => {
  const { totalMeasurementExpected, tasks } = input;

  // Se não há meta definida ou é zero/negativa, retorna 0%
  if (!totalMeasurementExpected || totalMeasurementExpected <= 0) {
    return { progressPercent: 0 };
  }

  // Se não há tasks, retorna 0%
  if (!tasks || tasks.length === 0) {
    return { progressPercent: 0 };
  }

  // Soma o progresso absoluto de todas as tasks
  const totalProgress = tasks.reduce(
    (sum, task) => sum + (task.progressAbsolute || 0),
    0,
  );

  // Calcula o percentual
  const percent = (totalProgress / totalMeasurementExpected) * 100;

  // Limita em 100% (não pode ultrapassar)
  return {
    progressPercent: Math.min(Math.round(percent * 100) / 100, 100),
  };
};
