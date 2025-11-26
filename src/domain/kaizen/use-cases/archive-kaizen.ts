// Use case: Archive Kaizen
// Arquiva um kaizen ativo

import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface ArchiveKaizenInput {
  kaizenId: string;
}

export interface ArchiveKaizenOutput {
  kaizen: KaizenEntity;
}

export const archiveKaizen = async (
  input: ArchiveKaizenInput,
  repository: IKaizenRepository,
): Promise<ArchiveKaizenOutput> => {
  const existing = await repository.findById(input.kaizenId);

  if (!existing) {
    throw new Error(`Kaizen not found: ${input.kaizenId}`);
  }

  if (existing.status === "ARCHIVED") {
    throw new Error("Kaizen is already archived");
  }

  const updatedKaizen: KaizenEntity = {
    ...existing,
    status: "ARCHIVED",
    updatedDate: new Date().toISOString(),
  };

  await repository.save(updatedKaizen);

  return { kaizen: updatedKaizen };
};
