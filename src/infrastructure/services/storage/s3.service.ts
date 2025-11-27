import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export type S3BucketType = "images" | "reports";

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
  private readonly client: S3Client;
  private readonly imagesBucket: string;
  private readonly reportsBucket: string;
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

    this.imagesBucket =
      this.configService?.get<string>("AWS_S3_IMAGES_BUCKET") ||
      "construgame-images-bucket";
    this.reportsBucket =
      this.configService?.get<string>("AWS_REPORTS_S3_BUCKET") ||
      "project-report-bucket";

    this.logger.log(
      `S3 Service configured - Images Bucket: ${this.imagesBucket}, Reports Bucket: ${this.reportsBucket}, Region: ${this.region}`,
    );
  }

  private getBucket(bucketType: S3BucketType): string {
    return bucketType === "reports" ? this.reportsBucket : this.imagesBucket;
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType: string,
    bucketType: S3BucketType = "images",
  ): Promise<string> {
    const bucket = this.getBucket(bucketType);
    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });
      await this.client.send(command);
      const url = `https://${bucket}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded successfully to ${bucketType}: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key} to ${bucketType}:`, error);
      throw error;
    }
  }

  async getPresignedUrl(
    key: string,
    expiresIn = 3600,
    bucketType: S3BucketType = "images",
  ): Promise<string> {
    const bucket = this.getBucket(bucketType);
    try {
      // Using @aws-sdk/s3-request-presigner
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(this.client, command, { expiresIn });
      this.logger.log(`Generated presigned URL for ${bucketType}: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key} in ${bucketType}:`, error);
      throw error;
    }
  }

  /**
   * Upload de imagem (atalho para o bucket de imagens)
   */
  async uploadImage(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType: string,
  ): Promise<string> {
    return this.uploadFile(key, body, contentType, "images");
  }

  /**
   * Upload de relatório (atalho para o bucket de reports)
   */
  async uploadReport(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType: string,
  ): Promise<string> {
    return this.uploadFile(key, body, contentType, "reports");
  }

  /**
   * Gerar URL pré-assinada para imagem
   */
  async getImagePresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.getPresignedUrl(key, expiresIn, "images");
  }

  /**
   * Gerar URL pré-assinada para relatório
   */
  async getReportPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    return this.getPresignedUrl(key, expiresIn, "reports");
  }
}
