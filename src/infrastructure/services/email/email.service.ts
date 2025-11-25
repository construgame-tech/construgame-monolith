import { randomUUID } from "node:crypto";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  SendSmtpEmail,
  SendSmtpEmailSender,
  SendSmtpEmailTo,
  TransactionalEmailsApi,
  TransactionalEmailsApiApiKeys,
} from "@sendinblue/client";
import type { IEmailService } from "./email.interface";

@Injectable()
export class EmailService implements IEmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly sendinblueClient: TransactionalEmailsApi;
  private sesClient: SESClient;
  private readonly fromEmail: string;
  private readonly appUrl: string;
  private readonly useSendinblue: boolean;

  constructor(private readonly configService: ConfigService) {
    this.fromEmail =
      this.configService?.get<string>("EMAIL_FROM") ||
      "tecnologia@construgame.com.br";
    this.appUrl =
      this.configService?.get<string>("APP_URL") ||
      "https://app.construgame.com.br";

    // Configuração do SendinBlue
    const sendinblueApiKey =
      this.configService?.get<string>("SENDINBLUE_API_KEY");
    this.useSendinblue = !!sendinblueApiKey;
    if (sendinblueApiKey) {
      this.sendinblueClient = new TransactionalEmailsApi();
      this.sendinblueClient.setApiKey(
        TransactionalEmailsApiApiKeys.apiKey,
        sendinblueApiKey,
      );
      this.logger.log(
        `SendinBlue configured with key: ${sendinblueApiKey.substring(0, 20)}...`,
      );
    } else {
      // Fallback para AWS SES
      const region =
        this.configService?.get<string>("AWS_REGION") || "sa-east-1";
      const accessKeyId = this.configService?.get<string>("AWS_ACCESS_KEY_ID");
      const secretAccessKey = this.configService?.get<string>(
        "AWS_SECRET_ACCESS_KEY",
      );

      if (!accessKeyId || !secretAccessKey) {
        this.logger.warn(
          "Neither SendinBlue nor AWS credentials configured. Email sending will fail!",
        );
      }

      this.sesClient = new SESClient({
        region,
        credentials:
          accessKeyId && secretAccessKey
            ? {
                accessKeyId,
                secretAccessKey,
              }
            : undefined,
      });
      this.logger.log("AWS SES configured as fallback");
    }
  }
  private async sendEmail(
    to: string,
    name: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    if (this.useSendinblue) {
      // Usar SendinBlue
      const message = new SendSmtpEmail();

      message.sender = new SendSmtpEmailSender();
      message.sender.email = this.fromEmail;
      message.sender.name = "Construgame";

      const toAddress = new SendSmtpEmailTo();
      toAddress.email = to;
      toAddress.name = name;
      message.to = [toAddress];
      message.subject = subject;
      message.htmlContent = htmlContent;

      try {
        await this.sendinblueClient.sendTransacEmail(message);
        this.logger.log(`Email sent to ${to} via SendinBlue`);
      } catch (error) {
        this.logger.error(
          `Failed to send email to ${to} via SendinBlue:`,
          error,
        );

        // Se a chave do SendinBlue não funcionar, tenta fallback para SES
        if (error.response?.statusCode === 401) {
          this.logger.warn(
            "SendinBlue API Key invalid, attempting fallback to AWS SES...",
          );

          if (!this.sesClient) {
            const region =
              this.configService.get<string>("AWS_REGION") || "sa-east-1";
            const accessKeyId =
              this.configService.get<string>("AWS_ACCESS_KEY_ID");
            const secretAccessKey = this.configService.get<string>(
              "AWS_SECRET_ACCESS_KEY",
            );

            this.sesClient = new SESClient({
              region,
              credentials:
                accessKeyId && secretAccessKey
                  ? {
                      accessKeyId,
                      secretAccessKey,
                    }
                  : undefined,
            });
          }

          // Tenta enviar via SES
          const params = {
            Destination: {
              ToAddresses: [to],
            },
            Message: {
              Body: {
                Html: {
                  Charset: "UTF-8",
                  Data: htmlContent,
                },
              },
              Subject: {
                Charset: "UTF-8",
                Data: subject,
              },
            },
            Source: this.fromEmail,
          };

          const command = new SendEmailCommand(params);
          const result = await this.sesClient.send(command);
          this.logger.log(
            `Email sent to ${to} via AWS SES (fallback). MessageId: ${result.MessageId}`,
          );
          return;
        }

        throw error;
      }
    } else {
      // Usar AWS SES como fallback
      const params = {
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Body: {
            Html: {
              Charset: "UTF-8",
              Data: htmlContent,
            },
          },
          Subject: {
            Charset: "UTF-8",
            Data: subject,
          },
        },
        Source: this.fromEmail,
      };

      try {
        const command = new SendEmailCommand(params);
        const result = await this.sesClient.send(command);
        this.logger.log(
          `Email sent to ${to} via AWS SES. MessageId: ${result.MessageId}`,
        );
      } catch (error) {
        this.logger.error(`Failed to send email to ${to} via AWS SES:`, error);
        throw error;
      }
    }
  }

  async sendWelcomeEmail(
    email: string,
    name: string,
    recoveryCode: string,
    userId: string,
  ): Promise<void> {
    const subject = "Convite - Construgame";
    const htmlContent = `
      <html>
        <head>
          <style>
            img {
              width:150px;
            }
          </style>
        </head>
        <body style="height:300px;text-align:center">
            <img src="https://construgame-images-bucket.s3.sa-east-1.amazonaws.com/construgame_logo.png">
            <p style="font-size:16px; color:black; margin-bottom:30px;">Olá, ${name}! </br> Você foi convidado para participar da Construgame </br> Clique no link para criar sua senha:</p>
            <a style="font-size:20px; padding: 10px 70px; background-color: black; color: white; text-decoration: none; border-radius: 5px;" href="${this.appUrl}/nova-senha?code=${recoveryCode}&userId=${userId}&email=${email}">Criar senha</a>
            <p style="color:gray;margin-top:40px;">Atenciosamente, Equipe Construgame</p>
            <span style="opacity: 0">${randomUUID()}</span>
        </body>
      </html>`;

    await this.sendEmail(email, name, subject, htmlContent);
  }

  async sendRecoverPasswordEmail(
    email: string,
    name: string,
    recoveryCode: string,
    userId: string,
  ): Promise<void> {
    const subject = "Recuperar Senha - Construgame";
    const htmlContent = `
      <html>
        <head>
          <style>
            img {
              width:150px;
            }
          </style>
        </head>
        <body style="height:300px;text-align:center">
            <img src="https://construgame-images-bucket.s3.sa-east-1.amazonaws.com/construgame_logo.png">
            <p style="font-size:16px; color:black; margin-bottom:30px;">Olá, ${name}! </br> Clique no link para criar uma nova senha:</p>
            <a style="font-size:20px; padding: 10px 70px; background-color: black; color: white; text-decoration: none; border-radius: 5px;" href="${this.appUrl}/nova-senha?code=${recoveryCode}&userId=${userId}&email=${email}">Criar nova senha</a>
            <p style="color:gray;margin-top:40px;">Atenciosamente, Equipe Construgame</p>
            <span style="opacity: 0">${randomUUID()}</span>
        </body>
      </html>`;

    await this.sendEmail(email, name, subject, htmlContent);
  }

  async sendAuthCodeEmail(
    email: string,
    name: string,
    authCode: string,
  ): Promise<void> {
    const subject = "Código de Autenticação - Construgame";
    const htmlContent = `
      <html>
        <head>
          <style>
            img {
              width:150px;
            }
          </style>
        </head>
        <body style="height:300px;text-align:center">
            <img src="https://construgame-images-bucket.s3.sa-east-1.amazonaws.com/construgame_logo.png">
            <p style="font-size:16px; color:black; margin-bottom:30px;">Olá, ${name}! </br> Seu código de autenticação é:</p>
            <p style="font-size:32px; font-weight: bold; letter-spacing: 8px; color: black;">${authCode}</p>
            <p style="font-size:14px; color:gray;">Este código expira em 5 minutos.</p>
            <p style="color:gray;margin-top:40px;">Atenciosamente, Equipe Construgame</p>
            <span style="opacity: 0">${randomUUID()}</span>
        </body>
      </html>`;

    await this.sendEmail(email, name, subject, htmlContent);
  }
}
