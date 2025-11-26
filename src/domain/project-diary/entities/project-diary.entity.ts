// Entidade de domínio: Project Diary
// Representa um diário diário de projeto (logs, clima, mão de obra, equipamentos)

export type Weather = "SUNNY" | "CLOUDY" | "RAINY";

export interface ProjectDiaryWeather {
  morning?: Weather;
  afternoon?: Weather;
  night?: Weather;
}

export interface ProjectDiaryEquipment {
  name: string;
  quantity: number;
}

export interface ProjectDiaryManpower {
  name: string;
  quantity: number;
}

export interface ProjectDiaryEntity {
  organizationId: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  weather?: ProjectDiaryWeather;
  equipment?: ProjectDiaryEquipment[];
  manpower?: ProjectDiaryManpower[];
  indirectManpower?: ProjectDiaryManpower[];
  sequence: number;
}

// Factory function para criar um novo project diary
export const createProjectDiaryEntity = (props: {
  organizationId: string;
  projectId: string;
  date: string;
  notes?: string;
  weather?: ProjectDiaryWeather;
  equipment?: ProjectDiaryEquipment[];
  manpower?: ProjectDiaryManpower[];
  indirectManpower?: ProjectDiaryManpower[];
}): ProjectDiaryEntity => {
  return {
    organizationId: props.organizationId,
    projectId: props.projectId,
    date: props.date,
    notes: props.notes,
    weather: props.weather,
    equipment: props.equipment,
    manpower: props.manpower,
    indirectManpower: props.indirectManpower,
    sequence: 0,
  };
};

// Factory function para atualizar um project diary (upsert)
export const updateProjectDiaryEntity = (
  currentDiary: ProjectDiaryEntity,
  updates: {
    notes?: string;
    weather?: ProjectDiaryWeather;
    equipment?: ProjectDiaryEquipment[];
    manpower?: ProjectDiaryManpower[];
    indirectManpower?: ProjectDiaryManpower[];
  },
): ProjectDiaryEntity => {
  return {
    ...currentDiary,
    notes: updates.notes ?? currentDiary.notes,
    weather: updates.weather ?? currentDiary.weather,
    equipment: updates.equipment ?? currentDiary.equipment,
    manpower: updates.manpower ?? currentDiary.manpower,
    indirectManpower: updates.indirectManpower ?? currentDiary.indirectManpower,
    sequence: currentDiary.sequence + 1,
  };
};
