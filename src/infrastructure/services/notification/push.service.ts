import {
  CreatePlatformEndpointCommand,
  PublishCommand,
  SNSClient,
} from "@aws-sdk/client-sns";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private readonly client: SNSClient;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService?.get<string>("AWS_REGION") || "sa-east-1";
    const accessKeyId = this.configService?.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService?.get<string>(
      "AWS_SECRET_ACCESS_KEY",
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        "AWS credentials not configured. Push notifications will fail!",
      );
    }

    this.client = new SNSClient({
      region,
      credentials:
        accessKeyId && secretAccessKey
          ? {
              accessKeyId,
              secretAccessKey,
            }
          : undefined,
    });
    this.logger.log(
      `Push Notification Service configured for region: ${region}`,
    );
  }

  async sendPush(
    title: string,
    body: string,
    endpointArn: string,
  ): Promise<void> {
    try {
      const payload = {
        default: body,
        APNS: JSON.stringify({ aps: { alert: { title, body } } }),
        GCM: JSON.stringify({ notification: { title, body } }),
        ADM: JSON.stringify({ data: { message: body } }),
      };
      const command = new PublishCommand({
        Message: JSON.stringify(payload),
        MessageStructure: "json",
        TargetArn: endpointArn,
      });
      const result = await this.client.send(command);
      this.logger.log(
        `Push notification sent to ${endpointArn}. MessageId: ${result.MessageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send push notification to ${endpointArn}:`,
        error,
      );
      throw error;
    }
  }

  async createEndpoint(
    token: string,
    platform: "ios" | "android",
  ): Promise<string> {
    try {
      const platformArn =
        platform === "ios"
          ? this.configService.get<string>("AWS_SNS_PLATFORM_ARN_IOS")
          : this.configService.get<string>("AWS_SNS_PLATFORM_ARN_ANDROID");

      if (!platformArn) {
        throw new Error(
          `Platform ARN not configured for ${platform.toUpperCase()}`,
        );
      }

      const command = new CreatePlatformEndpointCommand({
        PlatformApplicationArn: platformArn,
        Token: token,
      });
      const response = await this.client.send(command);
      if (!response.EndpointArn) {
        throw new Error("EndpointArn not found in response");
      }
      this.logger.log(
        `Created endpoint for ${platform}: ${response.EndpointArn}`,
      );
      return response.EndpointArn;
    } catch (error) {
      this.logger.error(`Failed to create endpoint for ${platform}:`, error);
      throw error;
    }
  }
}
