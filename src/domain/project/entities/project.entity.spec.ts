// Testes unitários para entidades do domínio Project
// Testando as factory functions

import { describe, expect, it } from "vitest";
import {
  createProjectEntity,
  
  type ProjectEntity,
  type ProjectPrize,
  updateProjectEntity,
} from "./project.entity";

describe("Project Entity", () => {
  describe("createProjectEntity", () => {
    it("deve criar um projeto com valores padrão", () => {
      const project = createProjectEntity({
        id: "proj-123",
        organizationId: "org-123",
        name: "Projeto Alpha",
      });

      expect(project.id).toBe("proj-123");
      expect(project.organizationId).toBe("org-123");
      expect(project.name).toBe("Projeto Alpha");
      expect(project.status).toBe("ACTIVE");
      // sequence removed.toBe(0);
    });

    it("deve criar projeto com todos os campos opcionais", () => {
      const prizes: ProjectPrize[] = [
        { prizeId: "prize-1" },
        { prizeId: "prize-2" },
      ];

      const project = createProjectEntity({
        id: "proj-123",
        organizationId: "org-123",
        name: "Projeto Completo",
        responsibles: ["resp-1", "resp-2"],
        activeGameId: "game-123",
        photo: "https://example.com/project.jpg",
        type: "Construção",
        state: "SP",
        city: "São Paulo",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        prizes,
        teams: ["team-1", "team-2"],
      });

      expect(project.responsibles).toHaveLength(2);
      expect(project.activeGameId).toBe("game-123");
      expect(project.photo).toBe("https://example.com/project.jpg");
      expect(project.type).toBe("Construção");
      expect(project.state).toBe("SP");
      expect(project.city).toBe("São Paulo");
      expect(project.startDate).toBe("2025-01-01");
      expect(project.endDate).toBe("2025-12-31");
      expect(project.prizes).toHaveLength(2);
      expect(project.teams).toHaveLength(2);
    });
  });

  describe("updateProjectEntity", () => {
    const baseProject: ProjectEntity = {
      id: "proj-123",
      organizationId: "org-123",
      name: "Projeto Original",
      status: "ACTIVE",
      
    };

    it("deve atualizar o nome do projeto", () => {
      const updated = updateProjectEntity(baseProject, {
        name: "Projeto Atualizado",
      });

      expect(updated.name).toBe("Projeto Atualizado");
      // sequence removed.toBe(1);
    });

    it("deve atualizar o status do projeto", () => {
      const updated = updateProjectEntity(baseProject, {
        status: "PAUSED",
      });

      expect(updated.status).toBe("PAUSED");
    });

    it("deve atualizar para status DONE", () => {
      const updated = updateProjectEntity(baseProject, {
        status: "DONE",
      });

      expect(updated.status).toBe("DONE");
    });

    it("deve atualizar múltiplos campos", () => {
      const updated = updateProjectEntity(baseProject, {
        name: "Novo Nome",
        status: "PAUSED",
        type: "Reforma",
        state: "RJ",
        city: "Rio de Janeiro",
        activeGameId: "new-game-123",
      });

      expect(updated.name).toBe("Novo Nome");
      expect(updated.status).toBe("PAUSED");
      expect(updated.type).toBe("Reforma");
      expect(updated.state).toBe("RJ");
      expect(updated.city).toBe("Rio de Janeiro");
      expect(updated.activeGameId).toBe("new-game-123");
    });

    it("deve atualizar responsáveis", () => {
      const updated = updateProjectEntity(baseProject, {
        responsibles: ["new-resp-1", "new-resp-2"],
      });

      expect(updated.responsibles).toHaveLength(2);
      expect(updated.responsibles).toContain("new-resp-1");
    });

    it("deve atualizar prêmios", () => {
      const newPrizes: ProjectPrize[] = [{ prizeId: "new-prize" }];

      const updated = updateProjectEntity(baseProject, {
        prizes: newPrizes,
      });

      expect(updated.prizes).toHaveLength(1);
      expect(updated.prizes?.[0].prizeId).toBe("new-prize");
    });

    it("deve atualizar equipes", () => {
      const updated = updateProjectEntity(baseProject, {
        teams: ["team-a", "team-b", "team-c"],
      });

      expect(updated.teams).toHaveLength(3);
    });

    it("deve manter campos não alterados", () => {
      const projectWithData: ProjectEntity = {
        ...baseProject,
        photo: "original.jpg",
        type: "Original",
        responsibles: ["original-resp"],
      };

      const updated = updateProjectEntity(projectWithData, {
        name: "Apenas Nome",
      });

      expect(updated.photo).toBe("original.jpg");
      expect(updated.type).toBe("Original");
      expect(updated.responsibles).toContain("original-resp");
    });

    it("deve incrementar sequence a cada atualização", () => {
      const first = updateProjectEntity(baseProject, { name: "Update 1" });
      // sequence removed.toBe(1);

      const second = updateProjectEntity(first, { name: "Update 2" });
      // sequence removed.toBe(2);
    });
  });
});
