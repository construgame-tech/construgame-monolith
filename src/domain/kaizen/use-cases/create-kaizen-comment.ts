// Use Case: Criar um novo comentário em um kaizen

import { randomUUID } from "node:crypto";
import { createKaizenCommentEntity, KaizenCommentEntity } from "../entities/kaizen-comment.entity";
import type { IKaizenCommentRepository } from "../repositories/kaizen-comment.repository.interface";

export interface CreateKaizenCommentInput {
  kaizenId: string;
  userId: string;
  text: string;
}

export interface CreateKaizenCommentOutput {
  comment: KaizenCommentEntity;
}

export const createKaizenComment = async (
  input: CreateKaizenCommentInput,
  commentRepository: IKaizenCommentRepository,
): Promise<CreateKaizenCommentOutput> => {
  const comment = createKaizenCommentEntity({
    id: randomUUID(),
    kaizenId: input.kaizenId,
    userId: input.userId,
    text: input.text,
    createdAt: new Date().toISOString(),
  });

  await commentRepository.save(comment);

  return { comment };
};
