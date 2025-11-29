import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type IActivityProgressRepository,
  type ITaskProgressRepository,
  type SyncActivityProgressInput,
  syncActivityProgress,
} from "./sync-activity-progress";

describe("syncActivityProgress", () => {
  let mockActivityRepository: IActivityProgressRepository;
  let mockTaskRepository: ITaskProgressRepository;

  beforeEach(() => {
    mockActivityRepository = {
      findActivityById: vi.fn(),
      updateActivityProgress: vi.fn(),
      findActivitiesByMacrostepId: vi.fn(),
      updateMacrostepProgress: vi.fn(),
    };

    mockTaskRepository = {
      findTasksByActivityId: vi.fn(),
    };
  });

  describe("quando a activity não existe", () => {
    it("deve retornar null se a activity não for encontrada", async () => {
      vi.mocked(mockActivityRepository.findActivityById).mockResolvedValue(
        null,
      );

      const input: SyncActivityProgressInput = {
        activityId: "activity-123",
      };

      const result = await syncActivityProgress(
        input,
        mockActivityRepository,
        mockTaskRepository,
      );

      expect(result).toBeNull();
      expect(
        mockActivityRepository.updateActivityProgress,
      ).not.toHaveBeenCalled();
    });
  });

  describe("cálculo de progresso da activity", () => {
    it("deve calcular e atualizar o progresso da activity", async () => {
      vi.mocked(mockActivityRepository.findActivityById).mockResolvedValue({
        id: "activity-123",
        macrostepId: "macrostep-456",
        totalMeasurementExpected: "100",
        progressPercent: 0,
      });

      vi.mocked(mockTaskRepository.findTasksByActivityId).mockResolvedValue([
        { progressAbsolute: 25 },
        { progressAbsolute: 25 },
      ]);

      vi.mocked(
        mockActivityRepository.findActivitiesByMacrostepId,
      ).mockResolvedValue([
        {
          id: "activity-123",
          macrostepId: "macrostep-456",
          progressPercent: 0,
        },
      ]);

      const input: SyncActivityProgressInput = {
        activityId: "activity-123",
        syncMacrostep: true,
      };

      const result = await syncActivityProgress(
        input,
        mockActivityRepository,
        mockTaskRepository,
      );

      expect(result).not.toBeNull();
      expect(result?.activityProgress).toBe(50);
      expect(
        mockActivityRepository.updateActivityProgress,
      ).toHaveBeenCalledWith("activity-123", 50);
    });

    it("deve retornar 0% quando não há tasks", async () => {
      vi.mocked(mockActivityRepository.findActivityById).mockResolvedValue({
        id: "activity-123",
        macrostepId: "macrostep-456",
        totalMeasurementExpected: "100",
        progressPercent: 0,
      });

      vi.mocked(mockTaskRepository.findTasksByActivityId).mockResolvedValue([]);

      vi.mocked(
        mockActivityRepository.findActivitiesByMacrostepId,
      ).mockResolvedValue([
        {
          id: "activity-123",
          macrostepId: "macrostep-456",
          progressPercent: 0,
        },
      ]);

      const input: SyncActivityProgressInput = {
        activityId: "activity-123",
        syncMacrostep: true,
      };

      const result = await syncActivityProgress(
        input,
        mockActivityRepository,
        mockTaskRepository,
      );

      expect(result?.activityProgress).toBe(0);
    });
  });

  describe("sincronização do macrostep", () => {
    it("deve sincronizar o progresso do macrostep quando syncMacrostep é true", async () => {
      vi.mocked(mockActivityRepository.findActivityById).mockResolvedValue({
        id: "activity-123",
        macrostepId: "macrostep-456",
        totalMeasurementExpected: "100",
        progressPercent: 0,
      });

      vi.mocked(mockTaskRepository.findTasksByActivityId).mockResolvedValue([
        { progressAbsolute: 50 },
      ]);

      vi.mocked(
        mockActivityRepository.findActivitiesByMacrostepId,
      ).mockResolvedValue([
        {
          id: "activity-123",
          macrostepId: "macrostep-456",
          progressPercent: 25,
        },
        {
          id: "activity-456",
          macrostepId: "macrostep-456",
          progressPercent: 75,
        },
      ]);

      const input: SyncActivityProgressInput = {
        activityId: "activity-123",
        syncMacrostep: true,
      };

      const result = await syncActivityProgress(
        input,
        mockActivityRepository,
        mockTaskRepository,
      );

      expect(result?.macrostepId).toBe("macrostep-456");
      // Média: (50 (novo progresso) + 75) / 2 = 62.5
      expect(result?.macrostepProgress).toBe(62.5);
      expect(
        mockActivityRepository.updateMacrostepProgress,
      ).toHaveBeenCalledWith("macrostep-456", 62.5);
    });

    it("não deve sincronizar o macrostep quando syncMacrostep é false", async () => {
      vi.mocked(mockActivityRepository.findActivityById).mockResolvedValue({
        id: "activity-123",
        macrostepId: "macrostep-456",
        totalMeasurementExpected: "100",
        progressPercent: 0,
      });

      vi.mocked(mockTaskRepository.findTasksByActivityId).mockResolvedValue([
        { progressAbsolute: 50 },
      ]);

      const input: SyncActivityProgressInput = {
        activityId: "activity-123",
        syncMacrostep: false,
      };

      const result = await syncActivityProgress(
        input,
        mockActivityRepository,
        mockTaskRepository,
      );

      expect(result?.macrostepProgress).toBeUndefined();
      expect(
        mockActivityRepository.updateMacrostepProgress,
      ).not.toHaveBeenCalled();
    });
  });

  describe("tratamento de totalMeasurementExpected como string", () => {
    it("deve converter totalMeasurementExpected de string para número", async () => {
      vi.mocked(mockActivityRepository.findActivityById).mockResolvedValue({
        id: "activity-123",
        macrostepId: "macrostep-456",
        totalMeasurementExpected: "200",
        progressPercent: 0,
      });

      vi.mocked(mockTaskRepository.findTasksByActivityId).mockResolvedValue([
        { progressAbsolute: 100 },
      ]);

      vi.mocked(
        mockActivityRepository.findActivitiesByMacrostepId,
      ).mockResolvedValue([]);

      const input: SyncActivityProgressInput = {
        activityId: "activity-123",
        syncMacrostep: false,
      };

      const result = await syncActivityProgress(
        input,
        mockActivityRepository,
        mockTaskRepository,
      );

      // 100 / 200 * 100 = 50%
      expect(result?.activityProgress).toBe(50);
    });
  });
});
