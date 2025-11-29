import { describe, expect, it } from "vitest";
import {
  type CalculateMacrostepProgressInput,
  calculateMacrostepProgress,
} from "./calculate-macrostep-progress";

describe("calculateMacrostepProgress", () => {
  describe("quando não há activities", () => {
    it("deve retornar 0% quando activities é um array vazio", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [],
      };

      const result = calculateMacrostepProgress(input);

      expect(result.progressPercent).toBe(0);
    });
  });

  describe("cálculo de progresso médio", () => {
    it("deve calcular a média de progresso corretamente", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [
          { progressPercent: 50 },
          { progressPercent: 100 },
          { progressPercent: 0 },
        ],
      };

      const result = calculateMacrostepProgress(input);

      // (50 + 100 + 0) / 3 = 50
      expect(result.progressPercent).toBe(50);
    });

    it("deve retornar 100% quando todas as activities estão completas", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [{ progressPercent: 100 }, { progressPercent: 100 }],
      };

      const result = calculateMacrostepProgress(input);

      expect(result.progressPercent).toBe(100);
    });

    it("deve retornar 0% quando todas as activities estão zeradas", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [{ progressPercent: 0 }, { progressPercent: 0 }],
      };

      const result = calculateMacrostepProgress(input);

      expect(result.progressPercent).toBe(0);
    });

    it("deve lidar com progressPercent null", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [{ progressPercent: null }, { progressPercent: 50 }],
      };

      const result = calculateMacrostepProgress(input);

      // (0 + 50) / 2 = 25
      expect(result.progressPercent).toBe(25);
    });

    it("deve lidar com progressPercent undefined", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [{ progressPercent: undefined }, { progressPercent: 80 }],
      };

      const result = calculateMacrostepProgress(input);

      // (0 + 80) / 2 = 40
      expect(result.progressPercent).toBe(40);
    });

    it("deve arredondar para 2 casas decimais", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [
          { progressPercent: 33 },
          { progressPercent: 33 },
          { progressPercent: 34 },
        ],
      };

      const result = calculateMacrostepProgress(input);

      // (33 + 33 + 34) / 3 = 33.333...
      expect(result.progressPercent).toBe(33.33);
    });

    it("deve lidar com uma única activity", () => {
      const input: CalculateMacrostepProgressInput = {
        activities: [{ progressPercent: 75 }],
      };

      const result = calculateMacrostepProgress(input);

      expect(result.progressPercent).toBe(75);
    });
  });
});
