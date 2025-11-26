// Use case: Unarchive Kaizen
// Desarquiva um kaizen

import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface UnarchiveKaizenInput {
  kaizenId: string;
}

export interface UnarchiveKaizenOutput {
  kaizen: KaizenEntity;
}

export const unarchiveKaizen = async (
  input: UnarchiveKaizenInput,
  repository: IKaizenRepository,
): Promise<UnarchiveKaizenOutput> => {
  const existing = await repository.findById(input.kaizenId);

  if (!existing) {
    throw new Error(`Kaizen not found: ${input.kaizenId}`);
  }

  if (existing.status !== "ARCHIVED") {
    throw new Error("Kaizen is not archived");
  }

  const updatedKaizen: KaizenEntity = {
    ...existing,
    status: "ACTIVE",
    updatedDate: new Date().toISOString(),
  };

  await repository.save(updatedKaizen);

  return { kaizen: updatedKaizen };
};
