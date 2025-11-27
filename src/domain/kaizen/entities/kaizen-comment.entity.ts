// Entidade que representa um comentário de kaizen

export interface KaizenCommentEntity {
  id: string;
  kaizenId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export const createKaizenCommentEntity = (
  data: KaizenCommentEntity,
): KaizenCommentEntity => ({
  id: data.id,
  kaizenId: data.kaizenId,
  userId: data.userId,
  text: data.text,
  createdAt: data.createdAt,
});
