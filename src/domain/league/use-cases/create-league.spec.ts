import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLeague } from "./create-league";
import type { ILeagueRepository } from "../repositories/league.repository.interface";

describe("createLeague", () => {
  let mockRepository: ILeagueRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve criar uma league com sucesso", async () => {
    const input = {
      organizationId: "org-123",
      responsibleId: "user-123",
      name: "Liga Principal",
    };

    const result = await createLeague(input, mockRepository);

    expect(result.league).toBeDefined();
    expect(result.league.id).toBeDefined();
    expect(result.league.organizationId).toBe("org-123");
    expect(result.league.responsibleId).toBe("user-123");
    expect(result.league.name).toBe("Liga Principal");
    expect(result.league.status).toBe("ACTIVE");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve criar league com campos opcionais", async () => {
    const input = {
      organizationId: "org-123",
      responsibleId: "user-123",
      name: "Liga Gold",
      photo: "https://example.com/photo.jpg",
      objective: "Aumentar produtividade",
      startDate: "2025-01-01",
      endDate: "2025-12-31",
    };

    const result = await createLeague(input, mockRepository);

    expect(result.league.photo).toBe("https://example.com/photo.jpg");
    expect(result.league.objective).toBe("Aumentar produtividade");
    expect(result.league.startDate).toBe("2025-01-01");
    expect(result.league.endDate).toBe("2025-12-31");
  });

  it("deve gerar IDs únicos para cada league", async () => {
    const input = {
      organizationId: "org-123",
      responsibleId: "user-123",
      name: "Liga",
    };

    const result1 = await createLeague(input, mockRepository);
    const result2 = await createLeague(input, mockRepository);

    expect(result1.league.id).not.toBe(result2.league.id);
  });
});
