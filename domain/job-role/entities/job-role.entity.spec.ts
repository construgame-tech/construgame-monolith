// Testes unitários para entidades do domínio JobRole
// Testando as factory functions

import { describe, it, expect } from "vitest";
import {
  createJobRoleEntity,
  updateJobRoleEntity,
  incrementJobRoleSequence,
  type JobRoleEntity,
  type JobRoleVariant,
} from "./job-role.entity";

describe("JobRole Entity", () => {
  describe("createJobRoleEntity", () => {
    it("deve criar um job role com valores padrão", () => {
      const variants: JobRoleVariant[] = [
        { id: "variant-1", salary: 5000, seniority: "junior" },
      ];

      const jobRole = createJobRoleEntity({
        id: "job-123",
        organizationId: "org-123",
        name: "Desenvolvedor",
        variants,
      });

      expect(jobRole.id).toBe("job-123");
      expect(jobRole.organizationId).toBe("org-123");
      expect(jobRole.name).toBe("Desenvolvedor");
      expect(jobRole.variants).toHaveLength(1);
      expect(jobRole.sequence).toBe(0);
      expect(jobRole.createdAt).toBeDefined();
    });

    it("deve criar job role com múltiplas variantes", () => {
      const variants: JobRoleVariant[] = [
        { id: "v1", salary: 3000, seniority: "junior", state: "SP", hoursPerDay: 8 },
        { id: "v2", salary: 5000, seniority: "pleno", state: "SP", hoursPerDay: 8 },
        { id: "v3", salary: 8000, seniority: "senior", state: "SP", hoursPerDay: 8 },
      ];

      const jobRole = createJobRoleEntity({
        id: "job-123",
        organizationId: "org-123",
        name: "Engenheiro",
        variants,
        createdBy: "user-123",
      });

      expect(jobRole.variants).toHaveLength(3);
      expect(jobRole.createdBy).toBe("user-123");
    });

    it("deve criar job role com variantes em diferentes estados", () => {
      const variants: JobRoleVariant[] = [
        { id: "v1", salary: 5000, state: "SP" },
        { id: "v2", salary: 4500, state: "RJ" },
        { id: "v3", salary: 4000, state: "MG" },
      ];

      const jobRole = createJobRoleEntity({
        id: "job-123",
        organizationId: "org-123",
        name: "Analista",
        variants,
      });

      expect(jobRole.variants[0].state).toBe("SP");
      expect(jobRole.variants[1].state).toBe("RJ");
      expect(jobRole.variants[2].state).toBe("MG");
    });
  });

  describe("updateJobRoleEntity", () => {
    const baseJobRole: JobRoleEntity = {
      id: "job-123",
      organizationId: "org-123",
      name: "Cargo Original",
      variants: [{ id: "v1", salary: 5000 }],
      sequence: 0,
    };

    it("deve atualizar o nome do job role", () => {
      const updated = updateJobRoleEntity(baseJobRole, {
        name: "Cargo Atualizado",
      });

      expect(updated.name).toBe("Cargo Atualizado");
      expect(updated.sequence).toBe(1);
      expect(updated.updatedAt).toBeDefined();
    });

    it("deve atualizar as variantes", () => {
      const newVariants: JobRoleVariant[] = [
        { id: "new-v1", salary: 6000, seniority: "pleno" },
        { id: "new-v2", salary: 10000, seniority: "senior" },
      ];

      const updated = updateJobRoleEntity(baseJobRole, {
        variants: newVariants,
      });

      expect(updated.variants).toHaveLength(2);
      expect(updated.variants[0].salary).toBe(6000);
      expect(updated.variants[1].salary).toBe(10000);
    });

    it("deve registrar quem atualizou", () => {
      const updated = updateJobRoleEntity(baseJobRole, {
        name: "Novo Nome",
        updatedBy: "admin-123",
      });

      expect(updated.updatedBy).toBe("admin-123");
      expect(updated.updatedAt).toBeDefined();
    });

    it("deve atualizar nome e variantes juntos", () => {
      const newVariants: JobRoleVariant[] = [
        { id: "v1", salary: 7000, hoursPerDay: 6 },
      ];

      const updated = updateJobRoleEntity(baseJobRole, {
        name: "Cargo Premium",
        variants: newVariants,
        updatedBy: "user-456",
      });

      expect(updated.name).toBe("Cargo Premium");
      expect(updated.variants[0].salary).toBe(7000);
      expect(updated.variants[0].hoursPerDay).toBe(6);
      expect(updated.updatedBy).toBe("user-456");
    });

    it("deve manter campos não alterados", () => {
      const jobRoleWithData: JobRoleEntity = {
        ...baseJobRole,
        createdBy: "original-creator",
        createdAt: "2025-01-01T00:00:00.000Z",
      };

      const updated = updateJobRoleEntity(jobRoleWithData, {
        name: "Apenas Nome",
      });

      expect(updated.createdBy).toBe("original-creator");
      expect(updated.createdAt).toBe("2025-01-01T00:00:00.000Z");
      expect(updated.variants).toEqual(baseJobRole.variants);
    });

    it("deve incrementar sequence a cada atualização", () => {
      const first = updateJobRoleEntity(baseJobRole, { name: "Update 1" });
      expect(first.sequence).toBe(1);

      const second = updateJobRoleEntity(first, { name: "Update 2" });
      expect(second.sequence).toBe(2);
    });
  });

  describe("incrementJobRoleSequence", () => {
    it("deve incrementar a sequence", () => {
      const jobRole: JobRoleEntity = {
        id: "job-123",
        organizationId: "org-123",
        name: "Cargo",
        variants: [],
        sequence: 5,
      };

      const incremented = incrementJobRoleSequence(jobRole);

      expect(incremented.sequence).toBe(6);
      expect(incremented.id).toBe(jobRole.id);
      expect(incremented.name).toBe(jobRole.name);
    });
  });
});
