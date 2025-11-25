// Helper: Atualizar checklist preservando estado de checked
// Usado ao atualizar uma task para não perder o progresso do checklist

import { randomUUID } from "node:crypto";
import {
  TaskChecklistItem,
  TaskChecklistItemInput,
} from "../entities/task.entity";

export const updateChecklistPreservingState = (
  oldChecklist: TaskChecklistItem[] | undefined,
  newChecklist: TaskChecklistItemInput[] | undefined,
): TaskChecklistItem[] | undefined => {
  if (!newChecklist) return undefined;

  const checklistItemCheckedMap =
    oldChecklist?.reduce(
      (acc, item) => {
        acc[item.id] = item.checked;
        return acc;
      },
      {} as Record<string, boolean>,
    ) ?? {};

  const checklist = newChecklist?.map((item) => {
    const id = item.id || randomUUID();
    return {
      id,
      label: item.label,
      checked: checklistItemCheckedMap[id] || false,
    };
  });

  return checklist;
};
