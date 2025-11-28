import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteKaizenComment } from "./delete-kaizen-comment";
import type { IKaizenCommentRepository } from "../repositories/kaizen-comment.repository.interface";

describe("deleteKaizenComment", () => {
  let mockRepository: IKaizenCommentRepository;

  const existingComment = {
    id: "comment-123",
    kaizenId: "kaizen-123",
    userId: "user-123",
    text: "Comentário existente",
    createdAt: "2025-11-28T10:00:00.000Z",
  };

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(existingComment),
      findByKaizenId: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    };
  });

  it("deve deletar um comentário existente", async () => {
    await deleteKaizenComment({ commentId: "comment-123" }, mockRepository);

    expect(mockRepository.findById).toHaveBeenCalledWith("comment-123");
    expect(mockRepository.delete).toHaveBeenCalledWith("comment-123");
  });

  it("deve lançar erro quando comentário não existe", async () => {
    mockRepository.findById = vi.fn().mockResolvedValue(null);

    await expect(
      deleteKaizenComment({ commentId: "nonexistent-id" }, mockRepository)
    ).rejects.toThrow("Comment not found: nonexistent-id");
  });

  it("não deve chamar delete se comentário não existe", async () => {
    mockRepository.findById = vi.fn().mockResolvedValue(null);

    try {
      await deleteKaizenComment({ commentId: "nonexistent-id" }, mockRepository);
    } catch {
      // Esperado
    }

    expect(mockRepository.delete).not.toHaveBeenCalled();
  });
});
