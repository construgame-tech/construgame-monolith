import { describe, it, expect, vi, beforeEach } from "vitest";
import { listKaizenComments } from "./list-kaizen-comments";
import type { IKaizenCommentRepository } from "../repositories/kaizen-comment.repository.interface";

describe("listKaizenComments", () => {
  let mockRepository: IKaizenCommentRepository;

  const mockComments = [
    {
      id: "comment-1",
      kaizenId: "kaizen-123",
      userId: "user-1",
      text: "Primeiro comentário",
      createdAt: "2025-11-28T10:00:00.000Z",
    },
    {
      id: "comment-2",
      kaizenId: "kaizen-123",
      userId: "user-2",
      text: "Segundo comentário",
      createdAt: "2025-11-28T11:00:00.000Z",
    },
  ];

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findByKaizenId: vi.fn().mockResolvedValue(mockComments),
      delete: vi.fn(),
    };
  });

  it("deve listar todos os comentários de um kaizen", async () => {
    const result = await listKaizenComments(
      { kaizenId: "kaizen-123" },
      mockRepository
    );

    expect(result.comments).toHaveLength(2);
    expect(result.comments[0].text).toBe("Primeiro comentário");
    expect(result.comments[1].text).toBe("Segundo comentário");
    expect(mockRepository.findByKaizenId).toHaveBeenCalledWith("kaizen-123");
  });

  it("deve retornar lista vazia quando não há comentários", async () => {
    mockRepository.findByKaizenId = vi.fn().mockResolvedValue([]);

    const result = await listKaizenComments(
      { kaizenId: "kaizen-without-comments" },
      mockRepository
    );

    expect(result.comments).toHaveLength(0);
    expect(result.comments).toEqual([]);
  });
});
