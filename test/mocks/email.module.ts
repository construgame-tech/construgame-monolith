// Test Email Module - Mock for E2E tests
import { Module } from "@nestjs/common";
import { EmailService } from "../../src/infrastructure/services/email/email.service";

const mockEmailService = {
  sendWelcomeEmail: async () => true,
  sendPasswordResetEmail: async () => true,
  sendVerificationEmail: async () => true,
  sendEmail: async () => true,
  sendInvitationEmail: async () => true,
  sendNotificationEmail: async () => true,
};

@Module({
  providers: [
    {
      provide: EmailService,
      useValue: mockEmailService,
    },
  ],
  exports: [EmailService],
})
export class TestEmailModule {}
