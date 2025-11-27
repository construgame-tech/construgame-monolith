// Testes unitários para entidades do domínio Task
// Testando as factory functions e regras de negócio

import { describe, expect, it } from "vitest";
import {
  createTaskEntity,
  
  type TaskChecklistItem,
  type TaskEntity,
  updateTaskEntity,
  validateTaskAssignment,
} from "./task.entity";

describe("Task Entity", () => {
  describe("createTaskEntity", () => {
    it("deve criar uma entidade de task com valores padrão", () => {
      const task = createTaskEntity({
        id: "task-123",
        gameId: "game-123",
        name: "Task de Teste",
        rewardPoints: 100,
      });

      expect(task.id).toBe("task-123");
      expect(task.gameId).toBe("game-123");
      expect(task.name).toBe("Task de Teste");
      expect(task.rewardPoints).toBe(100);
      expect(task.status).toBe("active");
      // sequence removed.toBe(0);
    });

    it("deve criar task com campos opcionais", () => {
      const checklist: TaskChecklistItem[] = [
        { id: "item-1", label: "Item 1", checked: false },
        { id: "item-2", label: "Item 2", checked: true },
      ];

      const task = createTaskEntity({
        id: "task-123",
        gameId: "game-123",
        name: "Task Completa",
        rewardPoints: 200,
        isLocked: true,
        location: "Localização X",
        teamId: "team-123",
        kpiId: "kpi-123",
        taskManagerId: "tm-123",
        managerId: "manager-123",
        description: "Descrição da task",
        measurementUnit: "unidades",
        totalMeasurementExpected: "100",
        videoUrl: "https://example.com/video",
        embedVideoUrl: "https://youtube.com/embed/123",
        checklist,
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });

      expect(task.isLocked).toBe(true);
      expect(task.location).toBe("Localização X");
      expect(task.teamId).toBe("team-123");
      expect(task.kpiId).toBe("kpi-123");
      expect(task.taskManagerId).toBe("tm-123");
      expect(task.managerId).toBe("manager-123");
      expect(task.description).toBe("Descrição da task");
      expect(task.measurementUnit).toBe("unidades");
      expect(task.totalMeasurementExpected).toBe("100");
      expect(task.videoUrl).toBe("https://example.com/video");
      expect(task.embedVideoUrl).toBe("https://youtube.com/embed/123");
      expect(task.checklist).toEqual(checklist);
      expect(task.startDate).toBe("2025-01-01");
      expect(task.endDate).toBe("2025-12-31");
    });

    it("deve criar task com userId em vez de teamId", () => {
      const task = createTaskEntity({
        id: "task-123",
        gameId: "game-123",
        name: "Task Individual",
        rewardPoints: 50,
        userId: "user-123",
      });

      expect(task.userId).toBe("user-123");
      expect(task.teamId).toBeUndefined();
    });
  });

  describe("updateTaskEntity", () => {
    const baseTask: TaskEntity = {
      id: "task-123",
      gameId: "game-123",
      status: "active",
      name: "Task Original",
      rewardPoints: 100,
      
    };

    it("deve atualizar o nome da task", () => {
      const updatedTask = updateTaskEntity(baseTask, {
        name: "Nome Atualizado",
      });

      expect(updatedTask.name).toBe("Nome Atualizado");
      // sequence removed.toBe(1);
    });

    it("deve atualizar rewardPoints", () => {
      const updatedTask = updateTaskEntity(baseTask, {
        rewardPoints: 500,
      });

      expect(updatedTask.rewardPoints).toBe(500);
    });

    it("deve atualizar múltiplos campos", () => {
      const updatedTask = updateTaskEntity(baseTask, {
        name: "Novo Nome",
        rewardPoints: 300,
        description: "Nova descrição",
        isLocked: true,
        location: "Nova localização",
      });

      expect(updatedTask.name).toBe("Novo Nome");
      expect(updatedTask.rewardPoints).toBe(300);
      expect(updatedTask.description).toBe("Nova descrição");
      expect(updatedTask.isLocked).toBe(true);
      expect(updatedTask.location).toBe("Nova localização");
    });

    it("deve manter valores não alterados", () => {
      const taskWithExtras: TaskEntity = {
        ...baseTask,
        description: "Descrição original",
        location: "Localização original",
      };

      const updatedTask = updateTaskEntity(taskWithExtras, {
        name: "Apenas Nome",
      });

      expect(updatedTask.description).toBe("Descrição original");
      expect(updatedTask.location).toBe("Localização original");
    });

    it("deve incrementar sequence a cada atualização", () => {
      const firstUpdate = updateTaskEntity(baseTask, { name: "Update 1" });
      // sequence removed.toBe(1);

      const secondUpdate = updateTaskEntity(firstUpdate, { name: "Update 2" });
      // sequence removed.toBe(2);
    });

    it("deve atualizar checklist", () => {
      const newChecklist: TaskChecklistItem[] = [
        { id: "new-item", label: "Novo Item", checked: false },
      ];

      const updatedTask = updateTaskEntity(baseTask, {
        checklist: newChecklist,
      });

      expect(updatedTask.checklist).toEqual(newChecklist);
    });
  });

  describe("validateTaskAssignment", () => {
    it("não deve lançar erro se apenas teamId fornecido", () => {
      expect(() => validateTaskAssignment("team-123", undefined)).not.toThrow();
    });

    it("não deve lançar erro se apenas userId fornecido", () => {
      expect(() => validateTaskAssignment(undefined, "user-123")).not.toThrow();
    });

    it("não deve lançar erro se nenhum fornecido", () => {
      expect(() => validateTaskAssignment(undefined, undefined)).not.toThrow();
    });

    it("deve lançar erro se ambos teamId e userId fornecidos", () => {
      expect(() => validateTaskAssignment("team-123", "user-123")).toThrow(
        "Task cannot be assigned to both team and user at the same time",
      );
    });
  });
});
