// Testes unitários para entidades do domínio Member
// Testando as factory functions

import { describe, expect, it } from "vitest";
import {
  createMemberEntity,
  incrementMemberSequence,
  type MemberEntity,
  updateMemberEntity,
} from "./member.entity";

describe("Member Entity", () => {
  describe("createMemberEntity", () => {
    it("deve criar um member com valores padrão", () => {
      const member = createMemberEntity({
        userId: "user-123",
        organizationId: "org-123",
        role: "player",
      });

      expect(member.userId).toBe("user-123");
      expect(member.organizationId).toBe("org-123");
      expect(member.role).toBe("player");
      expect(member.sequence).toBe(0);
    });

    it("deve criar member com todos os campos opcionais", () => {
      const member = createMemberEntity({
        userId: "user-123",
        organizationId: "org-123",
        role: "manager",
        sectorId: "sector-123",
        sector: "TI",
        position: "Desenvolvedor",
        jobRoleId: "job-123",
        jobRoleVariantId: "variant-123",
        salary: 5000,
        seniority: "senior",
        state: "SP",
        hoursPerDay: 8,
      });

      expect(member.sectorId).toBe("sector-123");
      expect(member.sector).toBe("TI");
      expect(member.position).toBe("Desenvolvedor");
      expect(member.jobRoleId).toBe("job-123");
      expect(member.jobRoleVariantId).toBe("variant-123");
      expect(member.salary).toBe(5000);
      expect(member.seniority).toBe("senior");
      expect(member.state).toBe("SP");
      expect(member.hoursPerDay).toBe(8);
    });

    it("deve criar member com diferentes roles", () => {
      const owner = createMemberEntity({
        userId: "user-1",
        organizationId: "org-123",
        role: "owner",
      });
      const admin = createMemberEntity({
        userId: "user-2",
        organizationId: "org-123",
        role: "admin",
      });
      const financial = createMemberEntity({
        userId: "user-3",
        organizationId: "org-123",
        role: "financial",
      });

      expect(owner.role).toBe("owner");
      expect(admin.role).toBe("admin");
      expect(financial.role).toBe("financial");
    });
  });

  describe("updateMemberEntity", () => {
    const baseMember: MemberEntity = {
      userId: "user-123",
      organizationId: "org-123",
      role: "player",
      sequence: 0,
    };

    it("deve atualizar o role do member", () => {
      const updated = updateMemberEntity(baseMember, {
        role: "manager",
      });

      expect(updated.role).toBe("manager");
      expect(updated.sequence).toBe(1);
    });

    it("deve atualizar múltiplos campos", () => {
      const updated = updateMemberEntity(baseMember, {
        role: "admin",
        sector: "RH",
        position: "Gerente",
        salary: 8000,
        hoursPerDay: 6,
      });

      expect(updated.role).toBe("admin");
      expect(updated.sector).toBe("RH");
      expect(updated.position).toBe("Gerente");
      expect(updated.salary).toBe(8000);
      expect(updated.hoursPerDay).toBe(6);
    });

    it("deve manter campos não alterados", () => {
      const memberWithData: MemberEntity = {
        ...baseMember,
        sector: "TI",
        position: "Dev",
        jobRoleId: "job-123",
      };

      const updated = updateMemberEntity(memberWithData, {
        role: "manager",
      });

      expect(updated.sector).toBe("TI");
      expect(updated.position).toBe("Dev");
      expect(updated.jobRoleId).toBe("job-123");
    });

    it("deve atualizar job role data", () => {
      const updated = updateMemberEntity(baseMember, {
        jobRoleId: "new-job",
        jobRoleVariantId: "new-variant",
        seniority: "pleno",
        state: "RJ",
      });

      expect(updated.jobRoleId).toBe("new-job");
      expect(updated.jobRoleVariantId).toBe("new-variant");
      expect(updated.seniority).toBe("pleno");
      expect(updated.state).toBe("RJ");
    });
  });

  describe("incrementMemberSequence", () => {
    it("deve incrementar a sequence", () => {
      const member: MemberEntity = {
        userId: "user-123",
        organizationId: "org-123",
        role: "player",
        sequence: 5,
      };

      const incremented = incrementMemberSequence(member);

      expect(incremented.sequence).toBe(6);
      expect(incremented.userId).toBe(member.userId);
      expect(incremented.organizationId).toBe(member.organizationId);
    });
  });
});
