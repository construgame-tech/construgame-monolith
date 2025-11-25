import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import { Injectable, Logger } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: SNSClient;
  private readonly senderId: string;

  constructor(private readonly configService: ConfigService) {
    const region = this.configService?.get<string>("AWS_REGION") || "sa-east-1";
    const accessKeyId = this.configService?.get<string>("AWS_ACCESS_KEY_ID");
    const secretAccessKey = this.configService?.get<string>(
      "AWS_SECRET_ACCESS_KEY",
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn(
        "AWS credentials not configured. SMS sending will fail!",
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

    this.senderId =
      this.configService?.get<string>("SMS_SENDER_ID") || "Construgame";
    this.logger.log(`SMS Service configured for region: ${region}`);
  }

  async sendSms(phoneNumber: string, message: string): Promise<void> {
    try {
      const command = new PublishCommand({
        PhoneNumber: phoneNumber,
        Message: message,
        MessageAttributes: {
          "AWS.SNS.SMS.SenderID": {
            DataType: "String",
            StringValue: this.senderId,
          },
          "AWS.SNS.SMS.SMSType": {
            DataType: "String",
            StringValue: "Transactional",
          },
        },
      });
      const result = await this.client.send(command);
      this.logger.log(
        `SMS sent to ${phoneNumber}. MessageId: ${result.MessageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      throw error;
    }
  }
}
