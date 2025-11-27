import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KpiService } from "../kpi/kpi.service";
import { ConfigKpiController } from "./config-kpi.controller";

describe("ConfigKpiController", () => {
  let controller: ConfigKpiController;
  let kpiService: KpiService;

  const mockKpiService = {
    listAll: vi.fn(),
    createKpi: vi.fn(),
    updateKpi: vi.fn(),
    deleteKpi: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfigKpiController],
      providers: [
        {
          provide: KpiService,
          useValue: mockKpiService,
        },
      ],
    }).compile();

    controller = module.get<ConfigKpiController>(ConfigKpiController);
    kpiService = module.get<KpiService>(KpiService);
  });

  describe("findAll", () => {
    it("should return list of KPIs", async () => {
      // Arrange
      const organizationId = "org-123";
      const mockKpis = [
        { id: "kpi-1", name: "KPI 1", type: "percentage" },
        { id: "kpi-2", name: "KPI 2", type: "number" },
      ];

      vi.spyOn(kpiService, "listAll").mockResolvedValue(mockKpis);

      // Act
      const result = await controller.findAll(organizationId);

      // Assert
      expect(result.items).toHaveLength(2);
      expect(kpiService.listAll).toHaveBeenCalled();
    });

    it("should return empty array when no KPIs exist", async () => {
      // Arrange
      const organizationId = "org-123";
      vi.spyOn(kpiService, "listAll").mockResolvedValue([]);

      // Act
      const result = await controller.findAll(organizationId);

      // Assert
      expect(result.items).toHaveLength(0);
    });
  });

  describe("create", () => {
    it("should create a new KPI", async () => {
      // Arrange
      const organizationId = "org-123";
      const dto = { name: "Taxa de Conclusão", type: "percentage" };
      const mockKpi = { id: "kpi-123", ...dto };

      vi.spyOn(kpiService, "createKpi").mockResolvedValue(mockKpi);

      // Act
      const result = await controller.create(organizationId, dto);

      // Assert
      expect(result).toMatchObject({
        id: "kpi-123",
        name: dto.name,
        type: dto.type,
      });
      expect(kpiService.createKpi).toHaveBeenCalledWith(dto);
    });
  });

  describe("update", () => {
    it("should update an existing KPI", async () => {
      // Arrange
      const organizationId = "org-123";
      const kpiId = "kpi-123";
      const dto = { name: "Updated Name", type: "number" };
      const mockKpi = { id: kpiId, ...dto };

      vi.spyOn(kpiService, "updateKpi").mockResolvedValue(mockKpi);

      // Act
      const result = await controller.update(organizationId, kpiId, dto);

      // Assert
      expect(result).toMatchObject({
        id: kpiId,
        name: dto.name,
        type: dto.type,
      });
      expect(kpiService.updateKpi).toHaveBeenCalledWith({ kpiId, ...dto });
    });

    it("should throw NotFoundException when KPI does not exist", async () => {
      // Arrange
      const organizationId = "org-123";
      const kpiId = "non-existent";
      const dto = { name: "Updated Name" };

      vi.spyOn(kpiService, "updateKpi").mockRejectedValue(
        new NotFoundException(`KPI not found: ${kpiId}`),
      );

      // Act & Assert
      await expect(
        controller.update(organizationId, kpiId, dto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("delete", () => {
    it("should delete an existing KPI", async () => {
      // Arrange
      const organizationId = "org-123";
      const kpiId = "kpi-123";

      vi.spyOn(kpiService, "deleteKpi").mockResolvedValue(undefined);

      // Act
      await controller.delete(organizationId, kpiId);

      // Assert
      expect(kpiService.deleteKpi).toHaveBeenCalledWith(kpiId);
    });

    it("should throw NotFoundException when KPI does not exist", async () => {
      // Arrange
      const organizationId = "org-123";
      const kpiId = "non-existent";

      vi.spyOn(kpiService, "deleteKpi").mockRejectedValue(
        new NotFoundException(`KPI not found: ${kpiId}`),
      );

      // Act & Assert
      await expect(controller.delete(organizationId, kpiId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
