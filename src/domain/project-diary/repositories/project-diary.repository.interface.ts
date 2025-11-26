// Interface do repositório de Project Diary
// Define o contrato para persistência, sem implementação

import { ProjectDiaryEntity } from "../entities/project-diary.entity";

export interface IProjectDiaryRepository {
  // Upsert um project diary (create ou update baseado na chave: organizationId + projectId + date)
  upsert(diary: ProjectDiaryEntity): Promise<void>;

  // Busca um diary por organização, projeto e data
  findByDate(
    organizationId: string,
    projectId: string,
    date: string,
  ): Promise<ProjectDiaryEntity | null>;

  // Lista todos os diaries de um projeto
  findByProjectId(
    organizationId: string,
    projectId: string,
  ): Promise<ProjectDiaryEntity[]>;

  // Lista opções disponíveis (equipamentos, mão de obra) para autocomplete
  findEquipmentOptions(
    organizationId: string,
    projectId: string,
  ): Promise<string[]>;
  findManpowerOptions(
    organizationId: string,
    projectId: string,
  ): Promise<string[]>;
}
