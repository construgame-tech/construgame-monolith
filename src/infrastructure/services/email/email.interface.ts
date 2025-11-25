export interface IEmailService {
  sendWelcomeEmail(
    email: string,
    name: string,
    recoveryCode: string,
    userId: string,
  ): Promise<void>;
  sendRecoverPasswordEmail(
    email: string,
    name: string,
    recoveryCode: string,
    userId: string,
  ): Promise<void>;
  sendAuthCodeEmail(
    email: string,
    name: string,
    authCode: string,
  ): Promise<void>;
}
