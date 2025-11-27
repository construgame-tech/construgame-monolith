import type { KaizenCommentEntity } from "../entities/kaizen-comment.entity";

// Interface para o repositório de comentários de kaizen
export interface IKaizenCommentRepository {
  save(comment: KaizenCommentEntity): Promise<void>;
  findById(id: string): Promise<KaizenCommentEntity | null>;
  findByKaizenId(kaizenId: string): Promise<KaizenCommentEntity[]>;
  delete(id: string): Promise<void>;
}
