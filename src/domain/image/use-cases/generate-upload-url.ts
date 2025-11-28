// Use Case: Gerar URL pré-assinada para upload de imagem/arquivo

import {
  createUploadMetadata,
  ImageType,
  PresignedUrlEntity,
} from "../entities/presigned-url.entity";
import { IImageStorageRepository } from "../repositories/image-storage.repository.interface";

export interface GenerateUploadUrlInput {
  organizationId: string;
  fileName: string;
  fileType: string;
  imageType?: ImageType;
}

export interface GenerateUploadUrlOutput {
  presignedUrl: PresignedUrlEntity;
}

export const generateUploadUrl = async (
  input: GenerateUploadUrlInput,
  repository: IImageStorageRepository,
): Promise<GenerateUploadUrlOutput> => {
  const { organizationId, fileName, fileType, imageType = "image" } = input;

  // Cria metadados do upload usando a factory do domain
  const { key, contentType } = createUploadMetadata({
    organizationId,
    fileName,
    fileType,
    imageType,
  });

  // Gera a URL pré-assinada via repositório
  const presignedUrl = await repository.generatePresignedUrl(key, contentType);

  return { presignedUrl };
};
