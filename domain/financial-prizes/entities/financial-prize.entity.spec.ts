import { describe, it, expect, beforeEach, vi } from "vitest";
import { createFinancialPrizeEntity } from "./financial-prize.entity";

describe("FinancialPrizeEntity", () => {
  describe("createFinancialPrizeEntity", () => {
    const validInput = {
      id: "fp-123",
      organizationId: "org-123",
      projectId: "proj-123",
      gameId: "game-123",
      userId: "user-123",
      amount: 1500.5,
      period: "2025-01",
    };

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T10:00:00.000Z"));
    });

    it("should create entity with required fields", () => {
      const prize = createFinancialPrizeEntity(validInput);

      expect(prize.id).toBe("fp-123");
      expect(prize.organizationId).toBe("org-123");
      expect(prize.projectId).toBe("proj-123");
      expect(prize.gameId).toBe("game-123");
      expect(prize.userId).toBe("user-123");
      expect(prize.amount).toBe(1500.5);
      expect(prize.period).toBe("2025-01");
    });

    it("should set sequence to 0 by default", () => {
      const prize = createFinancialPrizeEntity(validInput);

      expect(prize.sequence).toBe(0);
    });

    it("should set calculatedAt to current timestamp", () => {
      const prize = createFinancialPrizeEntity(validInput);

      expect(prize.calculatedAt).toBe("2025-01-15T10:00:00.000Z");
    });

    it("should create entity with optional details", () => {
      const inputWithDetails = {
        ...validInput,
        details: {
          laborCost: 5000,
          kpiMultiplier: 1.2,
          taskPoints: 150,
          kaizenPoints: 50,
        },
      };

      const prize = createFinancialPrizeEntity(inputWithDetails);

      expect(prize.details).toEqual({
        laborCost: 5000,
        kpiMultiplier: 1.2,
        taskPoints: 150,
        kaizenPoints: 50,
      });
    });

    it("should create entity with partial details", () => {
      const inputWithPartialDetails = {
        ...validInput,
        details: {
          laborCost: 3000,
          taskPoints: 100,
        },
      };

      const prize = createFinancialPrizeEntity(inputWithPartialDetails);

      expect(prize.details?.laborCost).toBe(3000);
      expect(prize.details?.taskPoints).toBe(100);
      expect(prize.details?.kpiMultiplier).toBeUndefined();
      expect(prize.details?.kaizenPoints).toBeUndefined();
    });

    it("should create entity without details when not provided", () => {
      const prize = createFinancialPrizeEntity(validInput);

      expect(prize.details).toBeUndefined();
    });

    it("should handle decimal amounts correctly", () => {
      const inputWithDecimal = {
        ...validInput,
        amount: 1234.56,
      };

      const prize = createFinancialPrizeEntity(inputWithDecimal);

      expect(prize.amount).toBe(1234.56);
    });

    it("should handle zero amount", () => {
      const inputWithZero = {
        ...validInput,
        amount: 0,
      };

      const prize = createFinancialPrizeEntity(inputWithZero);

      expect(prize.amount).toBe(0);
    });
  });
});
