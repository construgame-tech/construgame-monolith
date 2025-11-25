import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);
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
      this.configService?.get<string>("AWS_S3_BUCKET") || "construgame-bucket";
    this.logger.log(
      `S3 Service configured - Bucket: ${this.bucket}, Region: ${this.region}`,
    );
  }

  async uploadFile(
    key: string,
    body: Buffer | Uint8Array | Blob | string,
    contentType: string,
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });
      await this.client.send(command);
      const url = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
      this.logger.log(`File uploaded successfully: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to upload file ${key}:`, error);
      throw error;
    }
  }

  async getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      // Using @aws-sdk/s3-request-presigner
      const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
      const command = new GetObjectCommand({ Bucket: this.bucket, Key: key });
      const url = await getSignedUrl(this.client, command, { expiresIn });
      this.logger.log(`Generated presigned URL for: ${key}`);
      return url;
    } catch (error) {
      this.logger.error(`Failed to generate presigned URL for ${key}:`, error);
      throw error;
    }
  }
}
