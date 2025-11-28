import { generateUploadUrl } from "@domain/image";
import type { IImageStorageRepository } from "@domain/image/repositories/image-storage.repository.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class ImageService {
  constructor(
    @Inject("IImageStorageRepository")
    private readonly imageStorageRepository: IImageStorageRepository,
  ) {}

  async generatePresignedUrl(
    organizationId: string,
    fileName: string,
    fileType: string,
    imageType: "image" | "file" = "image",
  ) {
    const { presignedUrl } = await generateUploadUrl(
      {
        organizationId,
        fileName,
        fileType,
        imageType,
      },
      this.imageStorageRepository,
    );

    return presignedUrl;
  }

  async deleteFile(key: string): Promise<void> {
    return this.imageStorageRepository.deleteFile(key);
  }

  async fileExists(key: string): Promise<boolean> {
    return this.imageStorageRepository.fileExists(key);
  }
}
