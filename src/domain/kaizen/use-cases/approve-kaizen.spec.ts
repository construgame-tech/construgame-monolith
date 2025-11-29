import { describe, it, expect, vi, beforeEach } from "vitest";
import { approveKaizen } from "./approve-kaizen";
import type { IKaizenRepository } from "../repositories/kaizen.repository.interface";
import type { KaizenEntity } from "../entities/kaizen.entity";

describe("approveKaizen use case", () => {
  let mockRepository: IKaizenRepository;

  const createMockKaizen = (status: "ACTIVE" | "DONE" | "APPROVED" | "ARCHIVED"): KaizenEntity => ({
    id: "kaizen-123",
    organizationId: "org-123",
    projectId: "proj-123",
    gameId: "game-123",
    name: "Test Kaizen",
    status,
    createdDate: new Date().toISOString(),
    updatedDate: new Date().toISOString(),
    leaderId: "user-123",
    benefits: [],
    tasks: [],
    attachments: [],
  });

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockImplementation((kaizen) => Promise.resolve(kaizen)),
      findById: vi.fn(),
      findByGameId: vi.fn(),
      findByOrganizationId: vi.fn(),
      findByProjectId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("should approve a completed kaizen", async () => {
    const doneKaizen = createMockKaizen("DONE");
    vi.mocked(mockRepository.findById).mockResolvedValue(doneKaizen);

    const { kaizen } = await approveKaizen({ kaizenId: "kaizen-123" }, mockRepository);

    expect(kaizen.status).toBe("APPROVED");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: "APPROVED" }),
    );
  });

  it("should throw error when kaizen not found", async () => {
    vi.mocked(mockRepository.findById).mockResolvedValue(null);

    await expect(
      approveKaizen({ kaizenId: "nonexistent" }, mockRepository),
    ).rejects.toThrow("Kaizen not found");
  });

  it("should throw error when kaizen is already approved", async () => {
    const approvedKaizen = createMockKaizen("APPROVED");
    vi.mocked(mockRepository.findById).mockResolvedValue(approvedKaizen);

    await expect(
      approveKaizen({ kaizenId: "kaizen-123" }, mockRepository),
    ).rejects.toThrow("Kaizen is already approved");
  });

  it("should throw error when kaizen is not completed", async () => {
    const activeKaizen = createMockKaizen("ACTIVE");
    vi.mocked(mockRepository.findById).mockResolvedValue(activeKaizen);

    await expect(
      approveKaizen({ kaizenId: "kaizen-123" }, mockRepository),
    ).rejects.toThrow("Kaizen must be completed (DONE) before being approved");
  });

  it("should throw error when kaizen is archived", async () => {
    const archivedKaizen = createMockKaizen("ARCHIVED");
    vi.mocked(mockRepository.findById).mockResolvedValue(archivedKaizen);

    await expect(
      approveKaizen({ kaizenId: "kaizen-123" }, mockRepository),
    ).rejects.toThrow("Kaizen must be completed (DONE) before being approved");
  });
});
