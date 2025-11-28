import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateLeague } from "./update-league";
import type { ILeagueRepository } from "../repositories/league.repository.interface";

describe("updateLeague", () => {
  let mockRepository: ILeagueRepository;

  const existingLeague = {
    id: "league-123",
    organizationId: "org-123",
    responsibleId: "user-123",
    status: "ACTIVE" as const,
    name: "Original League",
    photo: "https://example.com/photo.jpg",
    objective: "Original objective",
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn().mockResolvedValue(existingLeague),
      findByOrganizationId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve atualizar uma league existente", async () => {
    const input = {
      organizationId: "org-123",
      leagueId: "league-123",
      name: "Updated League",
    };

    const result = await updateLeague(input, mockRepository);

    expect(result.league.name).toBe("Updated League");
    expect(mockRepository.findById).toHaveBeenCalledWith("org-123", "league-123");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve atualizar múltiplos campos", async () => {
    const input = {
      organizationId: "org-123",
      leagueId: "league-123",
      name: "Gold League",
      objective: "New objective",
      startDate: "2025-06-01",
    };

    const result = await updateLeague(input, mockRepository);

    expect(result.league.name).toBe("Gold League");
    expect(result.league.objective).toBe("New objective");
    expect(result.league.startDate).toBe("2025-06-01");
  });

  it("deve lançar erro quando league não existe", async () => {
    mockRepository.findById = vi.fn().mockResolvedValue(null);

    const input = {
      organizationId: "org-123",
      leagueId: "nonexistent-id",
      name: "Updated",
    };

    await expect(updateLeague(input, mockRepository)).rejects.toThrow(
      "League not found: nonexistent-id"
    );
  });

  it("deve manter valores originais quando não atualizados", async () => {
    const input = {
      organizationId: "org-123",
      leagueId: "league-123",
      name: "Updated Name",
    };

    const result = await updateLeague(input, mockRepository);

    expect(result.league.responsibleId).toBe("user-123");
    expect(result.league.status).toBe("ACTIVE");
    expect(result.league.photo).toBe("https://example.com/photo.jpg");
  });
});
