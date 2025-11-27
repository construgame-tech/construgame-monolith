import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DRIZZLE_CONNECTION } from "../database/drizzle.provider";
import { KaizenCommentRepository } from "./kaizen-comment.repository";

describe("KaizenCommentRepository", () => {
  let repository: KaizenCommentRepository;
  let mockDb: any;

  beforeEach(async () => {
    // Mock Drizzle query builder chain
    mockDb = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      onConflictDoUpdate: vi.fn().mockResolvedValue([]),
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue([]),
      limit: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KaizenCommentRepository,
        {
          provide: DRIZZLE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    repository = module.get<KaizenCommentRepository>(KaizenCommentRepository);
  });

  describe("save", () => {
    it("should insert comment into database", async () => {
      // Arrange
      const comment = {
        id: "comment-123",
        kaizenId: "kaizen-123",
        userId: "user-123",
        text: "Test comment",
        createdAt: "2025-01-01T10:00:00Z",
      };

      // Act
      await repository.save(comment);

      // Assert
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  describe("findByKaizenId", () => {
    it("should return comments for kaizen", async () => {
      // Arrange
      const kaizenId = "kaizen-123";
      const mockCommentRows = [
        {
          id: "comment-1",
          kaizenId: kaizenId,
          userId: "user-1",
          text: "First comment",
          createdAt: "2025-01-01T10:00:00Z",
        },
        {
          id: "comment-2",
          kaizenId: kaizenId,
          userId: "user-2",
          text: "Second comment",
          createdAt: "2025-01-01T11:00:00Z",
        },
      ];

      // findByKaizenId usa .where() como terminal (retorna Promise)
      mockDb.where.mockResolvedValue(mockCommentRows);

      // Act
      const result = await repository.findByKaizenId(kaizenId);

      // Assert
      expect(result).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it("should return empty array when no comments exist", async () => {
      // Arrange
      const kaizenId = "kaizen-123";
      mockDb.where.mockResolvedValue([]);

      // Act
      const result = await repository.findByKaizenId(kaizenId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe("findById", () => {
    it("should return comment when found", async () => {
      // Arrange
      const commentId = "comment-123";
      const mockCommentRow = {
        id: commentId,
        kaizen_id: "kaizen-123",
        user_id: "user-123",
        text: "Test comment",
        created_at: new Date("2025-01-01T10:00:00Z"),
      };

      mockDb.limit.mockResolvedValue([mockCommentRow]);

      // Act
      const result = await repository.findById(commentId);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(commentId);
    });

    it("should return null when comment not found", async () => {
      // Arrange
      const commentId = "non-existent";
      mockDb.limit.mockResolvedValue([]);

      // Act
      const result = await repository.findById(commentId);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete comment from database", async () => {
      // Arrange
      const commentId = "comment-123";
      mockDb.where.mockResolvedValue([]);

      // Act
      await repository.delete(commentId);

      // Assert
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });
});
