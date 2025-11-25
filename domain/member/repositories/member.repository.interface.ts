// Interface do repositório de Member
// Define o contrato para persistência, sem implementação
// A implementação real será feita na camada de infraestrutura (DynamoDB, Postgres + Drizzle, etc)

import { MemberEntity } from "../entities/member.entity";

export interface IMemberRepository {
  // Persiste um member (create ou update)
  save(member: MemberEntity): Promise<void>;

  // Remove um member
  delete(userId: string, organizationId: string): Promise<void>;

  // Busca um member por userId e organizationId
  findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<MemberEntity | null>;

  // Lista todos os members de uma organização
  findByOrganizationId(organizationId: string): Promise<MemberEntity[]>;

  // Lista todas as organizações de um usuário
  findByUserId(userId: string): Promise<MemberEntity[]>;
}
