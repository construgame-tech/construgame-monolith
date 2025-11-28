import { describe, it, expect, vi } from "vitest";
import { generateUploadUrl } from "./generate-upload-url";
import type { IImageStorageRepository } from "../repositories/image-storage.repository.interface";

describe("generateUploadUrl use case", () => {
  const mockRepository: IImageStorageRepository = {
    generatePresignedUrl: vi.fn().mockResolvedValue({
      url: "https://s3.example.com/presigned-url",
      key: "org-123/images/12345-test.jpg",
      expiresIn: 3600,
    }),
    deleteFile: vi.fn(),
    fileExists: vi.fn(),
  };

  it("should generate presigned url for image upload", async () => {
    const input = {
      organizationId: "org-123",
      fileName: "photo.jpg",
      fileType: "image/jpeg",
    };

    const { presignedUrl } = await generateUploadUrl(input, mockRepository);

    expect(presignedUrl).toBeDefined();
    expect(presignedUrl.url).toBe("https://s3.example.com/presigned-url");
    expect(mockRepository.generatePresignedUrl).toHaveBeenCalledTimes(1);
    expect(mockRepository.generatePresignedUrl).toHaveBeenCalledWith(
      expect.stringContaining("org-123/images/"),
      "image/jpeg",
    );
  });

  it("should generate presigned url for file upload", async () => {
    vi.clearAllMocks();

    const input = {
      organizationId: "org-456",
      fileName: "document.pdf",
      fileType: "application/pdf",
      imageType: "file" as const,
    };

    await generateUploadUrl(input, mockRepository);

    expect(mockRepository.generatePresignedUrl).toHaveBeenCalledWith(
      expect.stringContaining("org-456/files/"),
      "application/pdf",
    );
  });

  it("should sanitize file name in key", async () => {
    vi.clearAllMocks();

    const input = {
      organizationId: "org-123",
      fileName: "my file (1).jpg",
      fileType: "image/jpeg",
    };

    await generateUploadUrl(input, mockRepository);

    expect(mockRepository.generatePresignedUrl).toHaveBeenCalledWith(
      expect.stringContaining("my_file__1_.jpg"),
      "image/jpeg",
    );
  });
});
