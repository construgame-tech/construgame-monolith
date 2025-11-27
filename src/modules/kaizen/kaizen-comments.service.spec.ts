import type { IKaizenRepository } from "@domain/kaizen/repositories/kaizen.repository.interface";
import type { IKaizenCommentRepository } from "@domain/kaizen/repositories/kaizen-comment.repository.interface";
import { NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KaizenService } from "./kaizen.service";

describe("KaizenService - Comments", () => {
  let service: KaizenService;
  let commentRepository: IKaizenCommentRepository;

  const mockKaizenRepository: IKaizenRepository = {
    save: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByGameId: vi.fn(),
    findByProjectId: vi.fn(),
    findByOrganizationId: vi.fn(),
  };

  const mockCommentRepository: IKaizenCommentRepository = {
    save: vi.fn(),
    delete: vi.fn(),
    findById: vi.fn(),
    findByKaizenId: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KaizenService,
        {
          provide: "IKaizenRepository",
          useValue: mockKaizenRepository,
        },
        {
          provide: "IKaizenCommentRepository",
          useValue: mockCommentRepository,
        },
      ],
    }).compile();

    service = module.get<KaizenService>(KaizenService);
    commentRepository = module.get<IKaizenCommentRepository>(
      "IKaizenCommentRepository",
    );
  });

  describe("listComments", () => {
    it("should return list of comments for a kaizen", async () => {
      // Arrange
      const kaizenId = "kaizen-123";
      const mockComments = [
        {
          id: "comment-1",
          kaizenId,
          userId: "user-1",
          text: "Primeiro comentário",
          createdAt: "2025-01-01T10:00:00Z",
        },
        {
          id: "comment-2",
          kaizenId,
          userId: "user-2",
          text: "Segundo comentário",
          createdAt: "2025-01-01T11:00:00Z",
        },
      ];

      vi.spyOn(commentRepository, "findByKaizenId").mockResolvedValue(
        mockComments,
      );

      // Act
      const result = await service.listComments(kaizenId);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual(mockComments);
      expect(commentRepository.findByKaizenId).toHaveBeenCalledWith(kaizenId);
    });

    it("should return empty array when no comments exist", async () => {
      // Arrange
      const kaizenId = "kaizen-123";
      vi.spyOn(commentRepository, "findByKaizenId").mockResolvedValue([]);

      // Act
      const result = await service.listComments(kaizenId);

      // Assert
      expect(result).toHaveLength(0);
      expect(commentRepository.findByKaizenId).toHaveBeenCalledWith(kaizenId);
    });
  });

  describe("createComment", () => {
    it("should create a new comment", async () => {
      // Arrange
      const kaizenId = "kaizen-123";
      const userId = "user-123";
      const text = "Este é um comentário de teste";

      vi.spyOn(commentRepository, "save").mockResolvedValue(undefined);

      // Act
      const result = await service.createComment(kaizenId, userId, text);

      // Assert
      expect(result).toMatchObject({
        id: expect.any(String),
        kaizenId,
        userId,
        text,
        createdAt: expect.any(String),
      });
      expect(commentRepository.save).toHaveBeenCalledTimes(1);
      expect(commentRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          kaizenId,
          userId,
          text,
        }),
      );
    });

    it("should generate unique ID for each comment", async () => {
      // Arrange
      const kaizenId = "kaizen-123";
      const userId = "user-123";
      vi.spyOn(commentRepository, "save").mockResolvedValue(undefined);

      // Act
      const result1 = await service.createComment(
        kaizenId,
        userId,
        "Comentário 1",
      );
      const result2 = await service.createComment(
        kaizenId,
        userId,
        "Comentário 2",
      );

      // Assert
      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe("deleteComment", () => {
    it("should delete an existing comment", async () => {
      // Arrange
      const commentId = "comment-123";
      const mockComment = {
        id: commentId,
        kaizenId: "kaizen-123",
        userId: "user-123",
        text: "Comentário para deletar",
        createdAt: "2025-01-01T10:00:00Z",
      };

      vi.spyOn(commentRepository, "findById").mockResolvedValue(mockComment);
      vi.spyOn(commentRepository, "delete").mockResolvedValue(undefined);

      // Act
      await service.deleteComment(commentId);

      // Assert
      expect(commentRepository.findById).toHaveBeenCalledWith(commentId);
      expect(commentRepository.delete).toHaveBeenCalledWith(commentId);
    });

    it("should throw NotFoundException when comment does not exist", async () => {
      // Arrange
      const commentId = "non-existent-comment";
      vi.spyOn(commentRepository, "findById").mockResolvedValue(null);

      // Act & Assert
      await expect(service.deleteComment(commentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(commentRepository.findById).toHaveBeenCalledWith(commentId);
      expect(commentRepository.delete).not.toHaveBeenCalled();
    });
  });
});
