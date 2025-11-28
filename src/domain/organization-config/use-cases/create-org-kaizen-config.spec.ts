import { describe, it, expect, vi } from "vitest";
import { createOrgKaizenConfig } from "./create-org-kaizen-config";
import type { IOrgKaizenConfigRepository } from "../repositories/org-kaizen-config.repository.interface";

describe("createOrgKaizenConfig use case", () => {
  const mockRepository: IOrgKaizenConfigRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    findByOrganizationId: vi.fn(),
  };

  it("should create org kaizen config with category points", async () => {
    const input = {
      organizationId: "org-123",
      categoryPoints: {
        "1": { points: 10, description: "Pequena melhoria" },
        "2": { points: 20, description: "Média melhoria" },
        "3": { points: 30, description: "Grande melhoria" },
      },
    };

    const { config } = await createOrgKaizenConfig(input, mockRepository);

    expect(config).toBeDefined();
    expect(config.organizationId).toBe("org-123");
    expect(config.categoryPoints["1"].points).toBe(10);
    expect(config.categoryPoints["2"]?.points).toBe(20);
    expect(config.categoryPoints["3"]?.points).toBe(30);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(config);
  });

  it("should create org kaizen config with all categories", async () => {
    vi.clearAllMocks();

    const input = {
      organizationId: "org-456",
      categoryPoints: {
        "1": { points: 5 },
        "2": { points: 10 },
        "3": { points: 20 },
        "4": { points: 40 },
        "5": { points: 80 },
      },
    };

    const { config } = await createOrgKaizenConfig(input, mockRepository);

    expect(config.organizationId).toBe("org-456");
    expect(config.categoryPoints["1"].points).toBe(5);
    expect(config.categoryPoints["5"]?.points).toBe(80);
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });
});
