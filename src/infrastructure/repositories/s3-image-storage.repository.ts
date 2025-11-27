import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { IImageStorageRepository } from "@domain/image/repositories/image-storage.repository.interface";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3ImageStorageRepository implements IImageStorageRepository {
  private readonly logger = new Logger(S3ImageStorageRepository.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;

  constructor(private readonly configService: ConfigService) {
    this.region = this.configService?.get<string>("AWS_REGION") || "sa-east-1";
    const accessKeyId = this.configService?.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService?.get<string>(
      "AWS_SECRET_ACCESS_KEY",
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        "AWS credentials not configured. S3 operations will fail!",
      );
    }

    this.client = new S3Client({
      region: this.region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
    this.bucket =
      this.configService?.get<string>("AWS_S3_IMAGES_BUCKET") || "construgame-bucket";
    this.logger.log(
      `S3 Image Storage configured - Bucket: ${this.bucket}, Region: ${this.region}`,
    );
  }

  async generatePresignedUrl(
    key: string,
    contentType: string,
    expiresIn = 900,
  ): Promise<{ url: string; key: string; expiresIn: number }> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      });
      const url = await getSignedUrl(this.client, command, { expiresIn });
      this.logger.log(`Generated presigned URL for upload: ${key}`);
      return { url, key, expiresIn };
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}:`, error);
      throw error;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      this.logger.log(`File deleted successfully: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete file ${key}:`, error);
      throw error;
    }
  }

  async fileExists(key: string): Promise<boolean> {
    try {
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch (error: unknown) {
      const err = error as {
        name?: string;
        $metadata?: { httpStatusCode?: number };
      };
      if (err.name === "NotFound" || err.$metadata?.httpStatusCode === 404) {
        return false;
      }
      this.logger.error(`Failed to check if file ${key} exists:`, error);
      throw error;
    }
  }
}
