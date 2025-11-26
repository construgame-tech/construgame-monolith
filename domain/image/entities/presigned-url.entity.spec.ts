import { describe, it, expect, beforeEach, vi } from "vitest";
import { createUploadMetadata } from "./presigned-url.entity";

describe("PresignedUrlEntity", () => {
  describe("createUploadMetadata", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T10:00:00.000Z"));
    });

    it("should create metadata for image type", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "photo.jpg",
        fileType: "image/jpeg",
        imageType: "image",
      });

      expect(metadata.key).toContain("org-123/images/");
      expect(metadata.key).toContain("photo.jpg");
      expect(metadata.contentType).toBe("image/jpeg");
    });

    it("should create metadata for file type", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "document.pdf",
        fileType: "application/pdf",
        imageType: "file",
      });

      expect(metadata.key).toContain("org-123/files/");
      expect(metadata.key).toContain("document.pdf");
      expect(metadata.contentType).toBe("application/pdf");
    });

    it("should include timestamp in key", () => {
      const timestamp = Date.now();
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "test.png",
        fileType: "image/png",
        imageType: "image",
      });

      expect(metadata.key).toContain(timestamp.toString());
    });

    it("should sanitize filename with special characters", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "my file (1)@#$.jpg",
        fileType: "image/jpeg",
        imageType: "image",
      });

      expect(metadata.key).toContain("my_file__1____.jpg");
      expect(metadata.key).not.toContain("@");
      expect(metadata.key).not.toContain("#");
      expect(metadata.key).not.toContain("$");
      expect(metadata.key).not.toContain(" ");
      expect(metadata.key).not.toContain("(");
      expect(metadata.key).not.toContain(")");
    });

    it("should preserve valid characters in filename", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "valid-file_name.test.jpg",
        fileType: "image/jpeg",
        imageType: "image",
      });

      expect(metadata.key).toContain("valid-file_name.test.jpg");
    });

    it("should construct key in correct format", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-456",
        fileName: "image.png",
        fileType: "image/png",
        imageType: "image",
      });

      const expectedPattern = /^org-456\/images\/\d+-image\.png$/;
      expect(metadata.key).toMatch(expectedPattern);
    });

    it("should handle different content types", () => {
      const cases: { fileType: string; fileName: string }[] = [
        { fileType: "image/png", fileName: "test.png" },
        { fileType: "image/gif", fileName: "test.gif" },
        { fileType: "application/pdf", fileName: "doc.pdf" },
        { fileType: "text/plain", fileName: "notes.txt" },
      ];

      for (const { fileType, fileName } of cases) {
        const metadata = createUploadMetadata({
          organizationId: "org-123",
          fileName,
          fileType,
          imageType: "file",
        });

        expect(metadata.contentType).toBe(fileType);
      }
    });

    it("should handle empty filename", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "",
        fileType: "image/jpeg",
        imageType: "image",
      });

      expect(metadata.key).toContain("org-123/images/");
    });

    it("should handle filename with only special characters", () => {
      const metadata = createUploadMetadata({
        organizationId: "org-123",
        fileName: "@#$%^&*()",
        fileType: "image/jpeg",
        imageType: "image",
      });

      expect(metadata.key).toContain("_________");
    });
  });
});
