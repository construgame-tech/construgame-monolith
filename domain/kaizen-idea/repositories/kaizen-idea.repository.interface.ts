import { KaizenIdeaEntity } from "../entities/kaizen-idea.entity";

export interface IKaizenIdeaRepository {
  save(idea: KaizenIdeaEntity): Promise<void>;
  delete(organizationId: string, ideaId: string): Promise<void>;
  findById(
    organizationId: string,
    ideaId: string,
  ): Promise<KaizenIdeaEntity | null>;
  findByOrganizationId(organizationId: string): Promise<KaizenIdeaEntity[]>;
}
