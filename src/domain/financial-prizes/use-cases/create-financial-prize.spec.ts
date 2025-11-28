import { describe, it, expect, vi, beforeEach } from "vitest";
import { createFinancialPrize } from "./create-financial-prize";
import type { IFinancialPrizeRepository } from "../repositories/financial-prize.repository.interface";

describe("createFinancialPrize", () => {
  let mockRepository: IFinancialPrizeRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findByUserAndPeriod: vi.fn(),
      findByGameAndPeriod: vi.fn(),
      findByUser: vi.fn(),
    };
  });

  it("deve criar um prêmio financeiro com sucesso", async () => {
    const input = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      userId: "user-123",
      amount: 1500.50,
      period: "2025-11",
    };

    const result = await createFinancialPrize(input, mockRepository);

    expect(result.prize).toBeDefined();
    expect(result.prize.id).toBeDefined();
    expect(result.prize.organizationId).toBe("org-123");
    expect(result.prize.amount).toBe(1500.50);
    expect(result.prize.period).toBe("2025-11");
    expect(result.prize.calculatedAt).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar prêmio com detalhes opcionais", async () => {
    const input = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      userId: "user-123",
      amount: 2000,
      period: "2025-11",
      details: {
        laborCost: 5000,
        kpiMultiplier: 1.5,
        taskPoints: 100,
        kaizenPoints: 50,
      },
    };

    const result = await createFinancialPrize(input, mockRepository);

    expect(result.prize.details).toBeDefined();
    expect(result.prize.details?.laborCost).toBe(5000);
    expect(result.prize.details?.kpiMultiplier).toBe(1.5);
    expect(result.prize.details?.taskPoints).toBe(100);
    expect(result.prize.details?.kaizenPoints).toBe(50);
  });

  it("deve gerar calculatedAt automaticamente", async () => {
    const before = new Date();
    
    const input = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      userId: "user-123",
      amount: 1000,
      period: "2025-11",
    };

    const result = await createFinancialPrize(input, mockRepository);
    const after = new Date();

    const calculatedAt = new Date(result.prize.calculatedAt);
    expect(calculatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(calculatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("deve gerar IDs únicos para cada prêmio", async () => {
    const input = {
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      userId: "user-123",
      amount: 1000,
      period: "2025-11",
    };

    const result1 = await createFinancialPrize(input, mockRepository);
    const result2 = await createFinancialPrize(input, mockRepository);

    expect(result1.prize.id).not.toBe(result2.prize.id);
  });
});
