// Use Case: Deletar um comentário de kaizen

import type { IKaizenCommentRepository } from "../repositories/kaizen-comment.repository.interface";

export interface DeleteKaizenCommentInput {
  commentId: string;
}

export const deleteKaizenComment = async (
  input: DeleteKaizenCommentInput,
  commentRepository: IKaizenCommentRepository,
): Promise<void> => {
  const comment = await commentRepository.findById(input.commentId);

  if (!comment) {
    throw new Error(`Comment not found: ${input.commentId}`);
  }

  await commentRepository.delete(input.commentId);
};
