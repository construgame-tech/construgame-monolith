// Testes unitários para entidades do domínio Team
// Testando as factory functions

import { describe, expect, it } from "vitest";
import {
  createTeamEntity,
  incrementTeamSequence,
  type TeamEntity,
  updateTeamEntity,
} from "./team.entity";

describe("Team Entity", () => {
  describe("createTeamEntity", () => {
    it("deve criar uma equipe com valores padrão", () => {
      const team = createTeamEntity({
        id: "team-123",
        organizationId: "org-123",
        name: "Equipe Alpha",
      });

      expect(team.id).toBe("team-123");
      expect(team.organizationId).toBe("org-123");
      expect(team.name).toBe("Equipe Alpha");
      expect(team.sequence).toBe(0);
    });

    it("deve criar equipe com todos os campos opcionais", () => {
      const team = createTeamEntity({
        id: "team-123",
        organizationId: "org-123",
        name: "Equipe Beta",
        managerId: "manager-123",
        fieldOfAction: "Desenvolvimento",
        members: ["user-1", "user-2", "user-3"],
        photo: "https://example.com/team.jpg",
        color: "#FF5733",
        description: "Equipe de desenvolvimento web",
      });

      expect(team.managerId).toBe("manager-123");
      expect(team.fieldOfAction).toBe("Desenvolvimento");
      expect(team.members).toHaveLength(3);
      expect(team.members).toContain("user-1");
      expect(team.photo).toBe("https://example.com/team.jpg");
      expect(team.color).toBe("#FF5733");
      expect(team.description).toBe("Equipe de desenvolvimento web");
    });
  });

  describe("updateTeamEntity", () => {
    const baseTeam: TeamEntity = {
      id: "team-123",
      organizationId: "org-123",
      name: "Equipe Original",
      sequence: 0,
    };

    it("deve atualizar o nome da equipe", () => {
      const updated = updateTeamEntity(baseTeam, {
        name: "Equipe Atualizada",
      });

      expect(updated.name).toBe("Equipe Atualizada");
      expect(updated.sequence).toBe(1);
    });

    it("deve atualizar o gerente da equipe", () => {
      const updated = updateTeamEntity(baseTeam, {
        managerId: "new-manager-123",
      });

      expect(updated.managerId).toBe("new-manager-123");
    });

    it("deve atualizar membros da equipe", () => {
      const updated = updateTeamEntity(baseTeam, {
        members: ["user-1", "user-2"],
      });

      expect(updated.members).toHaveLength(2);
      expect(updated.members).toContain("user-1");
      expect(updated.members).toContain("user-2");
    });

    it("deve atualizar múltiplos campos", () => {
      const updated = updateTeamEntity(baseTeam, {
        name: "Novo Nome",
        managerId: "manager-456",
        fieldOfAction: "QA",
        photo: "new-photo.jpg",
      });

      expect(updated.name).toBe("Novo Nome");
      expect(updated.managerId).toBe("manager-456");
      expect(updated.fieldOfAction).toBe("QA");
      expect(updated.photo).toBe("new-photo.jpg");
    });

    it("deve manter campos não alterados", () => {
      const teamWithData: TeamEntity = {
        ...baseTeam,
        managerId: "original-manager",
        fieldOfAction: "Original",
        members: ["original-member"],
      };

      const updated = updateTeamEntity(teamWithData, {
        name: "Apenas Nome",
      });

      expect(updated.managerId).toBe("original-manager");
      expect(updated.fieldOfAction).toBe("Original");
      expect(updated.members).toContain("original-member");
    });

    it("deve incrementar sequence a cada atualização", () => {
      const first = updateTeamEntity(baseTeam, { name: "Update 1" });
      expect(first.sequence).toBe(1);

      const second = updateTeamEntity(first, { name: "Update 2" });
      expect(second.sequence).toBe(2);
    });
  });

  describe("incrementTeamSequence", () => {
    it("deve incrementar a sequence", () => {
      const team: TeamEntity = {
        id: "team-123",
        organizationId: "org-123",
        name: "Team",
        sequence: 10,
      };

      const incremented = incrementTeamSequence(team);

      expect(incremented.sequence).toBe(11);
      expect(incremented.id).toBe(team.id);
      expect(incremented.name).toBe(team.name);
    });
  });
});
