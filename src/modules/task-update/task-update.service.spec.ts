// Testes unitários do TaskUpdateService
// Foco: verificar cálculo de percent e atualização de progresso na Task

import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskUpdateService } from "./task-update.service";

// Mock das entidades e funções do domínio
vi.mock("@domain/task-update/entities/task-update.entity", () => ({
  createTaskUpdateEntity: vi.fn((props) => ({
    ...props,
    status: "PENDING_REVIEW",
    progress: props.progress,
  })),
  approveTaskUpdateEntity: vi.fn((current, props) => ({
    ...current,
    status: "APPROVED",
    reviwedBy: props?.reviwedBy,
    reviewNote: props?.reviewNote,
    progress: {
      ...current.progress,
      absolute: props?.progressAbsolute ?? current.progress.absolute,
    },
    participants: props?.participants ?? current.participants,
    checklist: props?.checklist ?? current.checklist,
    startDate: props?.startDate ?? current.startDate,
    endDate: props?.endDate ?? current.endDate,
  })),
  rejectTaskUpdateEntity: vi.fn((current, props) => ({
    ...current,
    status: "REJECTED",
    reviwedBy: props.reviwedBy,
    reviewNote: props.reviewNote,
  })),
  cancelTaskUpdateEntity: vi.fn((current) => ({
    ...current,
    status: "PENDING_REVIEW",
    reviwedBy: undefined,
    reviewNote: undefined,
  })),
}));

describe("TaskUpdateService", () => {
  let service: TaskUpdateService;
  let taskUpdateRepository: {
    save: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    findByTaskId: ReturnType<typeof vi.fn>;
    findByGameId: ReturnType<typeof vi.fn>;
    findByStatus: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    findByOrganizationId: ReturnType<typeof vi.fn>;
  };
  let taskRepository: {
    findById: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  const mockTask = {
    id: "task-123",
    gameId: "game-123",
    name: "Test Task",
    status: "active",
    rewardPoints: 100,
    totalMeasurementExpected: "1000",
    progress: {
      absolute: 0,
      percent: 0,
      updatedAt: new Date().toISOString(),
    },
    updates: [],
  };

  const mockTaskUpdate = {
    id: "update-123",
    gameId: "game-123",
    taskId: "task-123",
    status: "PENDING_REVIEW",
    submittedBy: "user-123",
    progress: {
      absolute: 500,
      percent: 50,
      updatedAt: new Date().toISOString(),
    },
  };

  beforeEach(async () => {
    taskUpdateRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(mockTaskUpdate),
      findByTaskId: vi.fn().mockResolvedValue([mockTaskUpdate]),
      findByGameId: vi.fn().mockResolvedValue([mockTaskUpdate]),
      findByStatus: vi.fn().mockResolvedValue([mockTaskUpdate]),
      delete: vi.fn().mockResolvedValue(undefined),
      findByOrganizationId: vi.fn().mockResolvedValue({
        data: [mockTaskUpdate],
        total: 1,
      }),
    };

    taskRepository = {
      findById: vi.fn().mockResolvedValue(mockTask),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const gameRepository = {
      findByIdOnly: vi.fn().mockResolvedValue({
        id: "game-123",
        organizationId: "org-123",
        projectId: "proj-123",
        name: "Test Game",
      }),
    };

    const userGamePointsRepository = {
      findByUserAndGame: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const teamGamePointsRepository = {
      findByTeamAndGame: vi.fn().mockResolvedValue(null),
      save: vi.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskUpdateService,
        {
          provide: "TaskUpdateRepository",
          useValue: taskUpdateRepository,
        },
        {
          provide: "ITaskRepository",
          useValue: taskRepository,
        },
        {
          provide: "IGameRepository",
          useValue: gameRepository,
        },
        {
          provide: "UserGamePointsRepository",
          useValue: userGamePointsRepository,
        },
        {
          provide: "TeamGamePointsRepository",
          useValue: teamGamePointsRepository,
        },
      ],
    }).compile();

    service = module.get<TaskUpdateService>(TaskUpdateService);
  });

  describe("create", () => {
    it("deve criar um task update com percent calculado quando absolute é fornecido e percent não", async () => {
      // Arrange
      const dto = {
        gameId: "game-123",
        taskId: "task-123",
        submittedBy: "user-123",
        progress: {
          absolute: 500,
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      const result = await service.create(dto);

      // Assert
      expect(taskRepository.findById).toHaveBeenCalledWith(
        "game-123",
        "task-123",
      );
      expect(taskUpdateRepository.save).toHaveBeenCalled();

      // Verifica que o percent foi calculado: (500/1000)*100 = 50%
      const savedEntity = (taskUpdateRepository.save as any).mock.calls[0][0];
      expect(savedEntity.progress.percent).toBe(50);
    });

    it("deve recalcular percent mesmo quando já foi fornecido (percent é calculado, não input manual)", async () => {
      // Arrange
      // O percent é sempre calculado pelo sistema com base em absolute/total
      // Não é aceito como input manual do usuário
      const dto = {
        gameId: "game-123",
        taskId: "task-123",
        submittedBy: "user-123",
        progress: {
          absolute: 500,
          percent: 75, // Percent fornecido será ignorado, calculado como (500/1000)*100 = 50%
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      await service.create(dto);

      // Assert - Percent deve ser recalculado, não mantido
      const savedEntity = (taskUpdateRepository.save as any).mock.calls[0][0];
      expect(savedEntity.progress.percent).toBe(50);
    });

    it("não deve calcular percent se task não tem totalMeasurementExpected", async () => {
      // Arrange
      taskRepository.findById.mockResolvedValue({
        ...mockTask,
        totalMeasurementExpected: undefined,
      });

      const dto = {
        gameId: "game-123",
        taskId: "task-123",
        submittedBy: "user-123",
        progress: {
          absolute: 500,
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      await service.create(dto);

      // Assert
      const savedEntity = (taskUpdateRepository.save as any).mock.calls[0][0];
      expect(savedEntity.progress.percent).toBeUndefined();
    });

    it("não deve calcular percent se absolute não foi fornecido", async () => {
      // Arrange
      const dto = {
        gameId: "game-123",
        taskId: "task-123",
        submittedBy: "user-123",
        progress: {
          note: "Just a note",
          updatedAt: new Date().toISOString(),
        },
      };

      // Act
      await service.create(dto);

      // Assert
      const savedEntity = (taskUpdateRepository.save as any).mock.calls[0][0];
      expect(savedEntity.progress.percent).toBeUndefined();
    });
  });

  describe("approve", () => {
    it("deve aprovar um task update", async () => {
      // Arrange
      const dto = {
        reviewedBy: "reviewer-123",
        reviewNote: "Looks good!",
      };

      const approvedUpdate = {
        ...mockTaskUpdate,
        status: "APPROVED",
        reviwedBy: "reviewer-123",
        reviewNote: "Looks good!",
      };
      taskUpdateRepository.save.mockResolvedValue(approvedUpdate);

      // Act
      const result = await service.approve("update-123", dto);

      // Assert
      expect(taskUpdateRepository.findById).toHaveBeenCalledWith("update-123");
      expect(taskUpdateRepository.save).toHaveBeenCalled();
      expect(result.status).toBe("APPROVED");
    });

    it("deve calcular e retornar percent no approve quando progressAbsolute é fornecido", async () => {
      // Arrange
      const dto = {
        reviewedBy: "reviewer-123",
        progressAbsolute: 300, // 300 de 1000 = 30%
      };

      const mockUpdateWithoutPercent = {
        ...mockTaskUpdate,
        progress: {
          absolute: 500,
          updatedAt: new Date().toISOString(),
          // Sem percent
        },
      };
      taskUpdateRepository.findById.mockResolvedValue(mockUpdateWithoutPercent);

      const approvedUpdate = {
        ...mockUpdateWithoutPercent,
        status: "APPROVED",
        reviwedBy: "reviewer-123",
        progress: {
          absolute: 300,
          percent: 30,
          updatedAt: new Date().toISOString(),
        },
      };
      taskUpdateRepository.save.mockResolvedValue(approvedUpdate);

      // Act
      const result = await service.approve("update-123", dto);

      // Assert - Deve ter calculado o percent
      expect(result.progress.percent).toBe(30);

      // Verifica que o percent foi calculado ao salvar
      const savedEntity = (taskUpdateRepository.save as any).mock.calls[0][0];
      expect(savedEntity.progress.percent).toBe(30); // (300/1000)*100
    });

    it("deve atualizar o progresso da Task quando um update é aprovado", async () => {
      // Arrange
      const dto = {
        reviewedBy: "reviewer-123",
      };

      const approvedUpdate = {
        ...mockTaskUpdate,
        status: "APPROVED",
        reviwedBy: "reviewer-123",
      };
      taskUpdateRepository.save.mockResolvedValue(approvedUpdate);

      // Act
      await service.approve("update-123", dto);

      // Assert - Task deve ter sido atualizada com o novo progresso
      expect(taskRepository.findById).toHaveBeenCalledWith(
        "game-123",
        "task-123",
      );
      expect(taskRepository.save).toHaveBeenCalled();

      // Verifica que a task foi salva com o progresso atualizado
      const savedTask = (taskRepository.save as any).mock.calls[0][0];
      expect(savedTask.updates).toHaveLength(1);
      expect(savedTask.updates[0].id).toBe("update-123");
      expect(savedTask.progress.absolute).toBe(500);
      expect(savedTask.progress.percent).toBe(50); // (500/1000)*100
    });

    it("deve lançar NotFoundException se task update não existe", async () => {
      // Arrange
      taskUpdateRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.approve("non-existent", { reviewedBy: "user-123" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("reject", () => {
    it("deve rejeitar um task update", async () => {
      // Arrange
      const dto = {
        reviewedBy: "reviewer-123",
        reviewNote: "Needs improvement",
      };

      const rejectedUpdate = {
        ...mockTaskUpdate,
        status: "REJECTED",
        reviwedBy: "reviewer-123",
        reviewNote: "Needs improvement",
      };
      taskUpdateRepository.save.mockResolvedValue(rejectedUpdate);

      // Act
      const result = await service.reject("update-123", dto);

      // Assert
      expect(taskUpdateRepository.findById).toHaveBeenCalledWith("update-123");
      expect(taskUpdateRepository.save).toHaveBeenCalled();
      expect(result.status).toBe("REJECTED");
    });

    it("deve lançar NotFoundException se task update não existe", async () => {
      // Arrange
      taskUpdateRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.reject("non-existent", { reviewedBy: "user-123" }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("findById", () => {
    it("deve retornar task update quando encontrado", async () => {
      // Act
      const result = await service.findById("update-123");

      // Assert
      expect(result).toEqual(mockTaskUpdate);
      expect(taskUpdateRepository.findById).toHaveBeenCalledWith("update-123");
    });

    it("deve lançar NotFoundException quando não encontrado", async () => {
      // Arrange
      taskUpdateRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findById("non-existent")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("cancel", () => {
    it("deve cancelar um task update aprovado", async () => {
      // Arrange
      const approvedUpdate = {
        ...mockTaskUpdate,
        status: "APPROVED",
      };
      taskUpdateRepository.findById.mockResolvedValue(approvedUpdate);

      const cancelledUpdate = {
        ...approvedUpdate,
        status: "PENDING_REVIEW",
        reviwedBy: undefined,
        reviewNote: undefined,
      };
      taskUpdateRepository.save.mockResolvedValue(cancelledUpdate);

      // Act
      const result = await service.cancel("update-123");

      // Assert
      expect(result.status).toBe("PENDING_REVIEW");
      expect(taskUpdateRepository.save).toHaveBeenCalled();
    });
  });
});
