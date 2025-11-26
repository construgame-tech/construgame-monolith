// Use case: Reopen Kaizen
// Reabre um kaizen que foi concluído

import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface ReopenKaizenInput {
  kaizenId: string;
}

export interface ReopenKaizenOutput {
  kaizen: KaizenEntity;
}

export const reopenKaizen = async (
  input: ReopenKaizenInput,
  repository: IKaizenRepository,
): Promise<ReopenKaizenOutput> => {
  const existing = await repository.findById(input.kaizenId);

  if (!existing) {
    throw new Error(`Kaizen not found: ${input.kaizenId}`);
  }

  if (existing.status === "ACTIVE") {
    throw new Error("Kaizen is already active");
  }

  if (existing.status === "ARCHIVED") {
    throw new Error("Cannot reopen an archived kaizen");
  }

  const updatedKaizen: KaizenEntity = {
    ...existing,
    status: "ACTIVE",
    updatedDate: new Date().toISOString(),
  };

  await repository.save(updatedKaizen);

  return { kaizen: updatedKaizen };
};
