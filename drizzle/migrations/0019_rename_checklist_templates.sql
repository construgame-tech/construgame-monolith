-- Renomeia a tabela de standalone_checklist_templates para reusable_checklist_templates
-- Nomenclatura mais adequada para templates de checklist reutilizáveis

ALTER TABLE standalone_checklist_templates
RENAME TO reusable_checklist_templates;