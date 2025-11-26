// Configure environment variables BEFORE any imports
process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  "postgresql://construgame:construgame_dev_password@localhost:5432/construgame";
process.env.JWT_SECRET = "test_jwt_secret_key_for_testing_only";
process.env.JWT_EXPIRATION = "1d";
process.env.AWS_REGION = "sa-east-1";
process.env.AWS_ACCESS_KEY_ID = "test_access_key";
process.env.AWS_SECRET_ACCESS_KEY = "test_secret_key";
process.env.AWS_S3_BUCKET = "test-bucket";
process.env.AWS_SNS_PLATFORM_ARN_ANDROID =
  "arn:aws:sns:sa-east-1:123456789:app/GCM/test";
process.env.AWS_SNS_PLATFORM_ARN_IOS =
  "arn:aws:sns:sa-east-1:123456789:app/APNS/test";
process.env.EMAIL_FROM = "noreply@test.construgame.com";
process.env.APP_URL = "http://localhost:3000";
process.env.SMS_SENDER_ID = "ConstrugameTest";

import { ValidationPipe } from "@nestjs/common";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { Test, type TestingModule } from "@nestjs/testing";
import { HttpExceptionFilter } from "../src/common/filters/http-exception.filter";
import { TransformInterceptor } from "../src/common/interceptors/transform.interceptor";
import { OrganizationRepository } from "../src/infrastructure/repositories/organization.repository";
import { JwtAuthGuard } from "../src/modules/auth/jwt-auth.guard";
import { MockAuthGuard } from "./mocks/auth.guard";
import { TestAppModule } from "./test-app.module";

let app: NestFastifyApplication | null = null;

export async function setupTestApp(): Promise<NestFastifyApplication> {
  if (app) {
    return app;
  }

  const testingModule: TestingModule = await Test.createTestingModule({
    imports: [TestAppModule.forRoot()],
  })
    .overrideGuard(JwtAuthGuard)
    .useClass(MockAuthGuard)
    .compile();

  // Debug: Check if OrganizationRepository is available
  try {
    const orgRepo = testingModule.get(OrganizationRepository, {
      strict: false,
    });
    console.log(
      "OrganizationRepository found in DI via class:",
      !!orgRepo,
      "instance:",
      (orgRepo as any)?.instanceId,
    );
  } catch {
    console.log("OrganizationRepository NOT found in DI");
  }

  // Debug: Check OrganizationController
  try {
    const { OrganizationController } = await import(
      "../src/modules/organization/organization.controller"
    );
    const orgController = testingModule.get(OrganizationController, {
      strict: false,
    });
    console.log("OrganizationController found in DI:", !!orgController);
    console.log(
      "OrganizationController.repository:",
      !!(orgController as any)?.organizationRepository,
      "instance:",
      (orgController as any)?.organizationRepository?.instanceId,
    );
  } catch {
    console.log("OrganizationController NOT found in DI");
  }

  app = testingModule.createNestApplication<NestFastifyApplication>(
    new FastifyAdapter(),
  );

  // Apply same configuration as main.ts
  app.setGlobalPrefix("api/v1");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      skipMissingProperties: false,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.init();
  await app.getHttpAdapter().getInstance().ready();

  return app;
}

export async function closeTestApp(): Promise<void> {
  if (app) {
    await app.close();
    app = null;
  }
}

export function getTestApp(): INestApplication | null {
  return app;
}
