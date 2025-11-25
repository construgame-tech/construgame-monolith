// Helper: Atualizar checklist de uma task
// Atualiza o status do checklist baseado nas atualizações aprovadas

import { TaskChecklistItem, TaskEntity } from "../entities/task.entity";

export const updateTaskChecklist = (
  task: TaskEntity,
): TaskChecklistItem[] | undefined => {
  // Primeiro, reseta todos os itens do checklist para não checados
  const checklist = task.checklist?.map((item) => ({
    ...item,
    checked: false,
  }));

  // Loop nas atualizações em ordem
  task.updates?.forEach((update) => {
    if (!update.checklist) return;

    // Atualiza o checklist da task baseado nos itens fornecidos
    update.checklist.forEach((checklistItem) => {
      const currentChecklistItem = checklist?.find(
        (item) => item.id === checklistItem.id,
      );
      if (!currentChecklistItem) return;

      currentChecklistItem.checked = checklistItem.checked;
    });
  });

  return checklist;
};
