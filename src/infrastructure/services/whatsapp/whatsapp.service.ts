import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const twilio = require("twilio");

// Interface para o cliente Twilio
interface TwilioClient {
  messages: {
    create: (options: {
      from: string;
      to: string;
      body?: string;
      contentSid?: string;
      contentVariables?: string;
    }) => Promise<{ sid: string }>;
  };
}

export interface WhatsAppMessageOptions {
  to: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  body?: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private client: TwilioClient | null = null;
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;
  private readonly devPhoneNumber: string;
  private readonly isLocalEnv: boolean;

  constructor(private readonly configService: ConfigService) {
    this.accountSid =
      this.configService.get<string>("TWILIO_ACCOUNT_SID") || "";
    this.authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN") || "";
    this.fromNumber =
      this.configService.get<string>("TWILIO_WHATSAPP_FROM") || "+16073884304";
    this.devPhoneNumber =
      this.configService.get<string>("DEV_PHONE_NUMBER") || "+5512991485120";
    this.isLocalEnv =
      this.configService.get<string>("NODE_ENV") === "development" ||
      this.configService.get<string>("STAGE") === "local";

    if (!this.accountSid || !this.authToken) {
      this.logger.warn(
        "Twilio credentials not configured. WhatsApp sending will fail!",
      );
    } else {
      this.logger.log("WhatsApp Service configured with Twilio");
    }
  }

  private getClient(): TwilioClient {
    if (this.client) return this.client;

    if (!this.accountSid || !this.authToken) {
      throw new Error("Twilio credentials not configured");
    }

    this.client = twilio(this.accountSid, this.authToken) as TwilioClient;
    return this.client;
  }

  /**
   * Envia mensagem WhatsApp usando template aprovado
   * @param to Número de destino no formato +5511999999999
   * @param templateId Content SID do template Twilio
   * @param variables Variáveis do template (ex: { "1": "código" })
   */
  async sendTemplateMessage(
    to: string,
    templateId: string,
    variables: Record<string, string>,
  ): Promise<string> {
    try {
      const client = this.getClient();
      const targetNumber = this.isLocalEnv ? this.devPhoneNumber : to;

      const message = await client.messages.create({
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${targetNumber}`,
        contentSid: templateId,
        contentVariables: JSON.stringify(variables),
      });

      this.logger.log(
        `WhatsApp template message sent to ${targetNumber}. SID: ${message.sid}`,
      );
      return message.sid;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Envia mensagem WhatsApp de texto simples (requer opt-in do usuário)
   * @param to Número de destino no formato +5511999999999
   * @param body Texto da mensagem
   */
  async sendTextMessage(to: string, body: string): Promise<string> {
    try {
      const client = this.getClient();
      const targetNumber = this.isLocalEnv ? this.devPhoneNumber : to;

      const message = await client.messages.create({
        from: `whatsapp:${this.fromNumber}`,
        to: `whatsapp:${targetNumber}`,
        body,
      });

      this.logger.log(
        `WhatsApp text message sent to ${targetNumber}. SID: ${message.sid}`,
      );
      return message.sid;
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp text to ${to}:`, error);
      throw error;
    }
  }

  /**
   * Envia código de autenticação via WhatsApp usando template aprovado
   * @param phone Número de destino no formato +5511999999999
   * @param name Nome do usuário (opcional, pode não ser usado no template)
   * @param authCode Código de autenticação
   */
  /**
   * Envia código de autenticação via WhatsApp usando template aprovado
   * @param phone Número de destino no formato +5511999999999
   * @param name Nome do usuário (opcional, pode não ser usado no template)
   * @param authCode Código de autenticação
   */
  async sendAuthCode(
    phone: string,
    name: string,
    authCode: string,
  ): Promise<string> {
    const templateId =
      this.configService.get<string>("TWILIO_WHATSAPP_TEMPLATE_ID") ||
      "HXa1a3895ab0ec8a0eae5df32625e8bb91";

    return this.sendTemplateMessage(phone, templateId, { "1": authCode });
  }
}
