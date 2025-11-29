// Use case: Approve Kaizen
// Marca um kaizen como aprovado (APPROVED), após ter sido concluído (DONE)

import type { KaizenEntity } from "../entities/kaizen.entity";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";

export interface ApproveKaizenInput {
  kaizenId: string;
}

export interface ApproveKaizenOutput {
  kaizen: KaizenEntity;
}

export const approveKaizen = async (
  input: ApproveKaizenInput,
  repository: IKaizenRepository,
): Promise<ApproveKaizenOutput> => {
  const existing = await repository.findById(input.kaizenId);

  if (!existing) {
    throw new Error(`Kaizen not found: ${input.kaizenId}`);
  }

  if (existing.status === "APPROVED") {
    throw new Error("Kaizen is already approved");
  }

  if (existing.status !== "DONE") {
    throw new Error("Kaizen must be completed (DONE) before being approved");
  }

  const updatedKaizen: KaizenEntity = {
    ...existing,
    status: "APPROVED",
    updatedDate: new Date().toISOString(),
  };

  await repository.save(updatedKaizen);

  return { kaizen: updatedKaizen };
};
