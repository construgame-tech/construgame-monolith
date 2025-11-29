import { describe, expect, it } from "vitest";
import {
  type CalculateActivityProgressInput,
  calculateActivityProgress,
} from "./calculate-activity-progress";

describe("calculateActivityProgress", () => {
  describe("quando totalMeasurementExpected é inválido", () => {
    it("deve retornar 0% quando totalMeasurementExpected é null", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: null,
        tasks: [{ progressAbsolute: 50 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(0);
    });

    it("deve retornar 0% quando totalMeasurementExpected é undefined", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: undefined,
        tasks: [{ progressAbsolute: 50 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(0);
    });

    it("deve retornar 0% quando totalMeasurementExpected é 0", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 0,
        tasks: [{ progressAbsolute: 50 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(0);
    });

    it("deve retornar 0% quando totalMeasurementExpected é negativo", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: -100,
        tasks: [{ progressAbsolute: 50 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(0);
    });
  });

  describe("quando não há tasks", () => {
    it("deve retornar 0% quando tasks é um array vazio", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 100,
        tasks: [],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(0);
    });
  });

  describe("cálculo de progresso", () => {
    it("deve calcular corretamente 50% de progresso", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 100,
        tasks: [{ progressAbsolute: 25 }, { progressAbsolute: 25 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(50);
    });

    it("deve calcular corretamente 100% de progresso", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 100,
        tasks: [{ progressAbsolute: 60 }, { progressAbsolute: 40 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(100);
    });

    it("deve limitar em 100% quando progresso ultrapassa a meta", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 100,
        tasks: [{ progressAbsolute: 80 }, { progressAbsolute: 80 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(100);
    });

    it("deve arredondar para 2 casas decimais", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 300,
        tasks: [{ progressAbsolute: 100 }],
      };

      const result = calculateActivityProgress(input);

      // 100 / 300 * 100 = 33.333...
      expect(result.progressPercent).toBe(33.33);
    });

    it("deve lidar com tasks com progressAbsolute 0", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 100,
        tasks: [{ progressAbsolute: 0 }, { progressAbsolute: 0 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(0);
    });

    it("deve lidar com uma única task", () => {
      const input: CalculateActivityProgressInput = {
        totalMeasurementExpected: 50,
        tasks: [{ progressAbsolute: 25 }],
      };

      const result = calculateActivityProgress(input);

      expect(result.progressPercent).toBe(50);
    });
  });
});
