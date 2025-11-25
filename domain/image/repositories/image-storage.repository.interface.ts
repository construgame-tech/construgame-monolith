import { PresignedUrlEntity } from "../entities/presigned-url.entity";

// Interface para serviço de armazenamento de imagens (S3, etc)
export interface IImageStorageRepository {
  // Gera uma URL pré-assinada para upload
  generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn?: number,
  ): Promise<PresignedUrlEntity>;

  // Deleta uma imagem/arquivo
  deleteFile(key: string): Promise<void>;

  // Verifica se um arquivo existe
  fileExists(key: string): Promise<boolean>;
}
