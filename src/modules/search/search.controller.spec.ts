import { Test, TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";

describe("SearchController", () => {
  let controller: SearchController;
  let service: SearchService;

  const mockSearchService = {
    searchUsers: vi.fn(),
    searchOrganizations: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        {
          provide: SearchService,
          useValue: mockSearchService,
        },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    service = module.get<SearchService>(SearchService);

    // Reset mocks between tests
    vi.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe("searchUsers", () => {
    it("should return matching users when query is valid", async () => {
      // Arrange
      const query = "john";
      const mockResults = [
        {
          id: "user-1",
          name: "John Doe",
          nickname: "johnd",
          photo: "photo.jpg",
        },
        { id: "user-2", name: "Johnny", nickname: undefined, photo: undefined },
      ];
      mockSearchService.searchUsers.mockResolvedValue(mockResults);

      // Act
      const result = await controller.searchUsers(query);

      // Assert
      expect(result).toEqual({ items: mockResults });
      expect(mockSearchService.searchUsers).toHaveBeenCalledWith(query);
      expect(mockSearchService.searchUsers).toHaveBeenCalledTimes(1);
    });

    it("should throw BadRequestException when query is empty", async () => {
      // Act & Assert
      await expect(controller.searchUsers("")).rejects.toThrow(
        "Query must be at least 2 characters",
      );
      expect(mockSearchService.searchUsers).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when query is too short", async () => {
      // Act & Assert
      await expect(controller.searchUsers("a")).rejects.toThrow(
        "Query must be at least 2 characters",
      );
      expect(mockSearchService.searchUsers).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when query is only whitespace", async () => {
      // Act & Assert
      await expect(controller.searchUsers("   ")).rejects.toThrow(
        "Query must be at least 2 characters",
      );
      expect(mockSearchService.searchUsers).not.toHaveBeenCalled();
    });

    it("should return empty array when no users match", async () => {
      // Arrange
      mockSearchService.searchUsers.mockResolvedValue([]);

      // Act
      const result = await controller.searchUsers("nonexistent");

      // Assert
      expect(result).toEqual({ items: [] });
    });
  });

  describe("searchOrganizations", () => {
    it("should return matching organizations when query is valid", async () => {
      // Arrange
      const query = "acme";
      const mockResults = [
        { id: "org-1", name: "ACME Corp", photo: "logo.jpg" },
        { id: "org-2", name: "ACME Inc", photo: undefined },
      ];
      mockSearchService.searchOrganizations.mockResolvedValue(mockResults);

      // Act
      const result = await controller.searchOrganizations(query);

      // Assert
      expect(result).toEqual({ items: mockResults });
      expect(mockSearchService.searchOrganizations).toHaveBeenCalledWith(query);
      expect(mockSearchService.searchOrganizations).toHaveBeenCalledTimes(1);
    });

    it("should throw BadRequestException when query is empty", async () => {
      // Act & Assert
      await expect(controller.searchOrganizations("")).rejects.toThrow(
        "Query must be at least 2 characters",
      );
      expect(mockSearchService.searchOrganizations).not.toHaveBeenCalled();
    });

    it("should throw BadRequestException when query is too short", async () => {
      // Act & Assert
      await expect(controller.searchOrganizations("x")).rejects.toThrow(
        "Query must be at least 2 characters",
      );
      expect(mockSearchService.searchOrganizations).not.toHaveBeenCalled();
    });

    it("should return empty array when no organizations match", async () => {
      // Arrange
      mockSearchService.searchOrganizations.mockResolvedValue([]);

      // Act
      const result = await controller.searchOrganizations("nonexistent");

      // Assert
      expect(result).toEqual({ items: [] });
    });
  });
});
