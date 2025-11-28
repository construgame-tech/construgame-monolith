import { describe, it, expect, vi, beforeEach } from "vitest";
import { createKaizenComment } from "./create-kaizen-comment";
import type { IKaizenCommentRepository } from "../repositories/kaizen-comment.repository.interface";

describe("createKaizenComment", () => {
  let mockRepository: IKaizenCommentRepository;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      findById: vi.fn(),
      findByKaizenId: vi.fn(),
      delete: vi.fn(),
    };
  });

  it("deve criar um comentário com sucesso", async () => {
    const input = {
      kaizenId: "kaizen-123",
      userId: "user-123",
      text: "Ótima ideia!",
    };

    const result = await createKaizenComment(input, mockRepository);

    expect(result.comment).toBeDefined();
    expect(result.comment.id).toBeDefined();
    expect(result.comment.kaizenId).toBe("kaizen-123");
    expect(result.comment.userId).toBe("user-123");
    expect(result.comment.text).toBe("Ótima ideia!");
    expect(result.comment.createdAt).toBeDefined();
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
  });

  it("deve gerar createdAt automaticamente no formato ISO", async () => {
    const before = new Date();

    const input = {
      kaizenId: "kaizen-123",
      userId: "user-123",
      text: "Comentário de teste",
    };

    const result = await createKaizenComment(input, mockRepository);
    const after = new Date();

    const createdAt = new Date(result.comment.createdAt);
    expect(createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it("deve gerar IDs únicos para cada comentário", async () => {
    const input = {
      kaizenId: "kaizen-123",
      userId: "user-123",
      text: "Comentário",
    };

    const result1 = await createKaizenComment(input, mockRepository);
    const result2 = await createKaizenComment(input, mockRepository);

    expect(result1.comment.id).not.toBe(result2.comment.id);
  });

  it("deve salvar comentário no repositório", async () => {
    const input = {
      kaizenId: "kaizen-123",
      userId: "user-456",
      text: "Precisamos revisar isso",
    };

    await createKaizenComment(input, mockRepository);

    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        kaizenId: "kaizen-123",
        userId: "user-456",
        text: "Precisamos revisar isso",
      })
    );
  });
});
