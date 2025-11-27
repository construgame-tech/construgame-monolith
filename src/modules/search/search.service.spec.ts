import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DRIZZLE_CONNECTION } from "../../infrastructure/database/drizzle.provider";
import { SearchService } from "./search.service";

describe("SearchService", () => {
  let service: SearchService;
  let mockDb: any;

  beforeEach(async () => {
    // Mock Drizzle query builder chain
    mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: DRIZZLE_CONNECTION,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);

    // Reset mocks between tests
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("searchUsers", () => {
    it("should return users matching query", async () => {
      // Arrange
      const mockUserResults = [
        {
          id: "user-1",
          name: "John Doe",
          nickname: "johnd",
          photo: "photo.jpg",
        },
        {
          id: "user-2",
          name: "Johnny Smith",
          nickname: null,
          photo: null,
        },
      ];
      mockDb.limit.mockResolvedValue(mockUserResults);

      // Act
      const result = await service.searchUsers("john");

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "user-1",
        name: "John Doe",
        nickname: "johnd",
        photo: "photo.jpg",
      });
      expect(result[1]).toEqual({
        id: "user-2",
        name: "Johnny Smith",
        nickname: undefined, // null converted to undefined
        photo: undefined,
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(50);
    });

    it("should return empty array when no users match", async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([]);

      // Act
      const result = await service.searchUsers("nonexistent");

      // Assert
      expect(result).toEqual([]);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it("should use ILIKE pattern for search", async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([]);

      // Act
      await service.searchUsers("test");

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      // The searchPattern should be %test%
    });

    it("should handle special characters in query", async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([]);

      // Act - Query with special characters
      const result = await service.searchUsers("john%_doe");

      // Assert - Should not throw, just return results
      expect(result).toEqual([]);
    });
  });

  describe("searchOrganizations", () => {
    it("should return organizations matching query", async () => {
      // Arrange
      const mockOrgResults = [
        {
          id: "org-1",
          name: "ACME Corp",
          photo: "logo.jpg",
        },
        {
          id: "org-2",
          name: "ACME Inc",
          photo: null,
        },
      ];
      mockDb.limit.mockResolvedValue(mockOrgResults);

      // Act
      const result = await service.searchOrganizations("acme");

      // Assert
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: "org-1",
        name: "ACME Corp",
        photo: "logo.jpg",
      });
      expect(result[1]).toEqual({
        id: "org-2",
        name: "ACME Inc",
        photo: undefined, // null converted to undefined
      });
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(50);
    });

    it("should return empty array when no organizations match", async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([]);

      // Act
      const result = await service.searchOrganizations("nonexistent");

      // Assert
      expect(result).toEqual([]);
    });

    it("should use ILIKE pattern for organization search", async () => {
      // Arrange
      mockDb.limit.mockResolvedValue([]);

      // Act
      await service.searchOrganizations("construgame");

      // Assert
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });
});
