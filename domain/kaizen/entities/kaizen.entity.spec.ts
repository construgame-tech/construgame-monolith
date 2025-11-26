// Testes unitários para entidades do domínio Kaizen
// Testando as factory functions e regras de negócio

import { describe, expect, it } from "vitest";
import {
  addReplicaToKaizenEntity,
  approveKaizenEntity,
  archiveKaizenEntity,
  completeKaizenEntity,
  createKaizenEntity,
  createKaizenReplicaEntity,
  incrementKaizenSequence,
  type KaizenBenefit,
  type KaizenEntity,
  type KaizenTask,
  reopenKaizenEntity,
  unarchiveKaizenEntity,
  updateKaizenEntity,
  updateReplicaFromOriginal,
} from "./kaizen.entity";

describe("Kaizen Entity", () => {
  describe("createKaizenEntity", () => {
    it("deve criar uma entidade de kaizen com valores padrão", () => {
      const kaizen = createKaizenEntity({
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen de Teste",
      });

      expect(kaizen.id).toBe("kaizen-123");
      expect(kaizen.organizationId).toBe("org-123");
      expect(kaizen.projectId).toBe("proj-123");
      expect(kaizen.gameId).toBe("game-123");
      expect(kaizen.name).toBe("Kaizen de Teste");
      expect(kaizen.status).toBe("ACTIVE");
      expect(kaizen.sequence).toBe(0);
      expect(kaizen.createdDate).toBeDefined();
    });

    it("deve criar kaizen com todos os campos opcionais", () => {
      const tasks: KaizenTask[] = [
        { name: "Tarefa 1", isComplete: false, responsibleId: "user-1" },
      ];
      const benefits: KaizenBenefit[] = [
        { kpiId: "kpi-1", description: "Benefício" },
      ];

      const kaizen = createKaizenEntity({
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen Completo",
        authorId: "author-123",
        description: "Descrição do kaizen",
        leaderId: "leader-123",
        teamId: "team-123",
        category: 1,
        currentSituation: "Situação atual",
        currentSituationImages: ["img1.jpg"],
        solution: "Solução proposta",
        solutionImages: ["img2.jpg"],
        tasks,
        benefits,
        kaizenTypeId: "type-123",
        kaizenIdeaId: "idea-123",
        responsibles: { players: ["p1"], teams: ["t1"] },
        files: ["file1.pdf"],
        resources: "Recursos necessários",
      });

      expect(kaizen.authorId).toBe("author-123");
      expect(kaizen.description).toBe("Descrição do kaizen");
      expect(kaizen.leaderId).toBe("leader-123");
      expect(kaizen.teamId).toBe("team-123");
      expect(kaizen.category).toBe(1);
      expect(kaizen.currentSituation).toBe("Situação atual");
      expect(kaizen.solution).toBe("Solução proposta");
      expect(kaizen.tasks).toHaveLength(1);
      expect(kaizen.benefits).toHaveLength(1);
      expect(kaizen.responsibles?.players).toContain("p1");
    });

    it("deve remover budget zero das tasks", () => {
      const kaizen = createKaizenEntity({
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        tasks: [
          { name: "Task", isComplete: false, responsibleId: "u1", budget: 0 },
        ],
      });

      expect(kaizen.tasks?.[0].budget).toBeUndefined();
    });
  });

  describe("updateKaizenEntity", () => {
    const baseKaizen: KaizenEntity = {
      id: "kaizen-123",
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      name: "Kaizen Original",
      status: "ACTIVE",
      createdDate: "2025-01-01T00:00:00.000Z",
      sequence: 0,
    };

    it("deve atualizar campos básicos", () => {
      const updated = updateKaizenEntity(baseKaizen, {
        name: "Nome Atualizado",
        currentSituation: "Nova situação",
      });

      expect(updated.name).toBe("Nome Atualizado");
      expect(updated.currentSituation).toBe("Nova situação");
      expect(updated.sequence).toBe(1);
      expect(updated.updatedDate).toBeDefined();
    });

    it("não deve permitir alterar líder/time quando kaizen está DONE", () => {
      const doneKaizen: KaizenEntity = {
        ...baseKaizen,
        status: "DONE",
        leaderId: "original-leader",
        teamId: "original-team",
      };

      const updated = updateKaizenEntity(doneKaizen, {
        leaderId: "new-leader",
        teamId: "new-team",
      });

      expect(updated.leaderId).toBe("original-leader");
      expect(updated.teamId).toBe("original-team");
    });

    it("não deve permitir alterar nome/categoria quando é réplica", () => {
      const replicaKaizen: KaizenEntity = {
        ...baseKaizen,
        originalKaizenId: "original-123",
        category: 1,
      };

      const updated = updateKaizenEntity(replicaKaizen, {
        name: "Novo Nome",
        category: 2,
      });

      expect(updated.name).toBe("Kaizen Original");
      expect(updated.category).toBe(1);
    });
  });

  describe("completeKaizenEntity", () => {
    it("deve completar um kaizen ativo", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      const completed = completeKaizenEntity(kaizen);

      expect(completed.status).toBe("DONE");
      expect(completed.sequence).toBe(1);
    });

    it("deve lançar erro se kaizen não está ativo", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "DONE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      expect(() => completeKaizenEntity(kaizen)).toThrow(
        "Kaizen is not active",
      );
    });
  });

  describe("approveKaizenEntity", () => {
    it("deve aprovar um kaizen completo", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "DONE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      const approved = approveKaizenEntity(kaizen);

      expect(approved.status).toBe("APPROVED");
      expect(approved.sequence).toBe(1);
    });

    it("deve retornar sem alteração se já aprovado", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "APPROVED",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 5,
      };

      const result = approveKaizenEntity(kaizen);

      expect(result.status).toBe("APPROVED");
      expect(result.sequence).toBe(5); // Não incrementou
    });

    it("deve lançar erro se kaizen não está completo", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      expect(() => approveKaizenEntity(kaizen)).toThrow(
        "Kaizen is not completed",
      );
    });
  });

  describe("reopenKaizenEntity", () => {
    it("deve reabrir um kaizen DONE", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "DONE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      const reopened = reopenKaizenEntity(kaizen);

      expect(reopened.status).toBe("ACTIVE");
    });

    it("deve reabrir um kaizen APPROVED", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "APPROVED",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      const reopened = reopenKaizenEntity(kaizen);

      expect(reopened.status).toBe("ACTIVE");
    });

    it("deve lançar erro se kaizen não está DONE/APPROVED", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      expect(() => reopenKaizenEntity(kaizen)).toThrow("Kaizen is not done");
    });
  });

  describe("archiveKaizenEntity", () => {
    it("deve arquivar um kaizen ativo", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      const archived = archiveKaizenEntity(kaizen);

      expect(archived.status).toBe("ARCHIVED");
    });

    it("deve lançar erro se kaizen não está ativo", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "DONE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      expect(() => archiveKaizenEntity(kaizen)).toThrow("Kaizen is not active");
    });
  });

  describe("unarchiveKaizenEntity", () => {
    it("deve desarquivar um kaizen arquivado", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ARCHIVED",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      const unarchived = unarchiveKaizenEntity(kaizen);

      expect(unarchived.status).toBe("ACTIVE");
    });

    it("deve lançar erro se kaizen não está arquivado", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
      };

      expect(() => unarchiveKaizenEntity(kaizen)).toThrow(
        "Kaizen is not archived",
      );
    });
  });

  describe("createKaizenReplicaEntity", () => {
    it("deve criar uma réplica de kaizen", () => {
      const replica = createKaizenReplicaEntity({
        id: "replica-123",
        originalKaizenId: "original-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        leaderId: "leader-123",
        name: "Kaizen Original",
        category: 1,
        tasks: [
          { name: "Task", isComplete: true, responsibleId: "old-leader" },
        ],
      });

      expect(replica.id).toBe("replica-123");
      expect(replica.originalKaizenId).toBe("original-123");
      expect(replica.status).toBe("ACTIVE");
      expect(replica.tasks?.[0].isComplete).toBe(false);
      expect(replica.tasks?.[0].responsibleId).toBe("leader-123");
    });
  });

  describe("addReplicaToKaizenEntity", () => {
    it("deve adicionar réplica à lista", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
        replicas: ["replica-1"],
      };

      const updated = addReplicaToKaizenEntity(kaizen, "replica-2");

      expect(updated.replicas).toContain("replica-1");
      expect(updated.replicas).toContain("replica-2");
      expect(updated.replicas).toHaveLength(2);
    });
  });

  describe("updateReplicaFromOriginal", () => {
    it("deve atualizar réplica com dados do original", () => {
      const replica: KaizenEntity = {
        id: "replica-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Nome Antigo",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 0,
        originalKaizenId: "original-123",
        category: 1,
      };

      const updated = updateReplicaFromOriginal(replica, {
        name: "Nome Novo",
        category: 2,
      });

      expect(updated.name).toBe("Nome Novo");
      expect(updated.category).toBe(2);
      expect(updated.sequence).toBe(1);
    });
  });

  describe("incrementKaizenSequence", () => {
    it("deve incrementar a sequence", () => {
      const kaizen: KaizenEntity = {
        id: "kaizen-123",
        organizationId: "org-123",
        projectId: "proj-123",
        gameId: "game-123",
        name: "Kaizen",
        status: "ACTIVE",
        createdDate: "2025-01-01T00:00:00.000Z",
        sequence: 5,
      };

      const incremented = incrementKaizenSequence(kaizen);

      expect(incremented.sequence).toBe(6);
    });
  });
});
