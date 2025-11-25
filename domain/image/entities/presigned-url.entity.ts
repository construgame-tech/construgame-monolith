// Entidade de domínio: Presigned URL
// Representa uma URL pré-assinada para upload de imagem/arquivo

export type ImageType = "image" | "file";

export interface PresignedUrlEntity {
  url: string;
  key: string;
  expiresIn: number; // segundos
}

// Gera metadados para uma imagem/arquivo a ser uploaded
export const createUploadMetadata = (props: {
  organizationId: string;
  fileName: string;
  fileType: string;
  imageType: ImageType;
}): { key: string; contentType: string } => {
  const timestamp = Date.now();
  const sanitizedFileName = props.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `${props.organizationId}/${props.imageType}s/${timestamp}-${sanitizedFileName}`;

  return {
    key,
    contentType: props.fileType,
  };
};
