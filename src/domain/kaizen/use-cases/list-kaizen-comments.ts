// Use Case: Listar comentários de um kaizen

import type { KaizenCommentEntity } from "../entities/kaizen-comment.entity";
import type { IKaizenCommentRepository } from "../repositories/kaizen-comment.repository.interface";

export interface ListKaizenCommentsInput {
  kaizenId: string;
}

export interface ListKaizenCommentsOutput {
  comments: KaizenCommentEntity[];
}

export const listKaizenComments = async (
  input: ListKaizenCommentsInput,
  commentRepository: IKaizenCommentRepository,
): Promise<ListKaizenCommentsOutput> => {
  const comments = await commentRepository.findByKaizenId(input.kaizenId);

  return { comments };
};
