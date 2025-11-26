// Use case: Complete Kaizen
// Marca um kaizen como concluído (DONE)

import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface CompleteKaizenInput {
  kaizenId: string;
}

export interface CompleteKaizenOutput {
  kaizen: KaizenEntity;
}

export const completeKaizen = async (
  input: CompleteKaizenInput,
  repository: IKaizenRepository,
): Promise<CompleteKaizenOutput> => {
  const existing = await repository.findById(input.kaizenId);

  if (!existing) {
    throw new Error(`Kaizen not found: ${input.kaizenId}`);
  }

  if (existing.status === "DONE" || existing.status === "APPROVED") {
    throw new Error("Kaizen is already completed");
  }

  if (existing.status === "ARCHIVED") {
    throw new Error("Cannot complete an archived kaizen");
  }

  const updatedKaizen: KaizenEntity = {
    ...existing,
    status: "DONE",
    updatedDate: new Date().toISOString(),
  };

  await repository.save(updatedKaizen);

  return { kaizen: updatedKaizen };
};
