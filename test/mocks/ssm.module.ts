// Test SSM Module - Mock for E2E tests
import { Module, Global } from "@nestjs/common";
import { SsmService } from "../../src/infrastructure/services/ssm/ssm.service";

/**
 * Mock do SsmService para testes.
 * Sempre retorna o secret de teste, sem fazer chamadas à AWS.
 */
const mockSsmService = {
  getJwtSecret: async () => "test_secret_key",
  getParameter: async (name: string, decrypt = false) => `mock_value_for_${name}`,
};

@Global()
@Module({
  providers: [
    {
      provide: SsmService,
      useValue: mockSsmService,
    },
  ],
  exports: [SsmService],
})
export class TestSsmModule {}
