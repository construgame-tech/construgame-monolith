// Test SMS Module - Mock for E2E tests
import { Module } from "@nestjs/common";
import { SmsService } from "../../src/infrastructure/services/sms/sms.service";

const mockSmsService = {
  sendSms: async () => true,
  sendVerificationCode: async () => true,
  sendNotification: async () => true,
};

@Module({
  providers: [
    {
      provide: SmsService,
      useValue: mockSmsService,
    },
  ],
  exports: [SmsService],
})
export class TestSmsModule {}
