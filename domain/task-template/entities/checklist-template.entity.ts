// Entidade de domínio: ChecklistTemplate
// Representa um template de checklist reutilizável

export interface ChecklistItem {
  label: string;
}

export interface ChecklistTemplateEntity {
  id: string;
  organizationId: string;
  name: string;
  checklist: ChecklistItem[];
}

// Factory function para criar um novo checklist template
export const createChecklistTemplateEntity = (props: {
  id: string;
  organizationId: string;
  name: string;
  checklist: ChecklistItem[];
}): ChecklistTemplateEntity => {
  return {
    id: props.id,
    organizationId: props.organizationId,
    name: props.name,
    checklist: props.checklist,
  };
};

// Factory function para atualizar um checklist template existente
export const updateChecklistTemplateEntity = (
  current: ChecklistTemplateEntity,
  updates: {
    name?: string;
    checklist?: ChecklistItem[];
  },
): ChecklistTemplateEntity => {
  return {
    ...current,
    name: updates.name ?? current.name,
    checklist: updates.checklist ?? current.checklist,
  };
};
