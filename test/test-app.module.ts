// Test App Module - usado apenas para testes E2E
// Mock de serviços externos para evitar dependências de ConfigService

import { type DynamicModule, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AppController } from "../src/app.controller";
import { AppService } from "../src/app.service";
import { DatabaseModule } from "../src/infrastructure/database/database.module";
import { EmailService } from "../src/infrastructure/services/email/email.service";
import { PushNotificationService } from "../src/infrastructure/services/notification/push.service";
import { SmsService } from "../src/infrastructure/services/sms/sms.service";
import { S3Service } from "../src/infrastructure/services/storage/s3.service";
import { FinancialPrizeModule } from "../src/modules/financial-prize/financial-prize.module";
// Import all feature modules
import { GameModule } from "../src/modules/game/game.module";
import { ImageModule } from "../src/modules/image/image.module";
import { JobRoleModule } from "../src/modules/job-role/job-role.module";
import { KaizenModule } from "../src/modules/kaizen/kaizen.module";
import { KaizenIdeaModule } from "../src/modules/kaizen-idea/kaizen-idea.module";
import { KaizenTypeModule } from "../src/modules/kaizen-type/kaizen-type.module";
import { KpiModule } from "../src/modules/kpi/kpi.module";
import { LeagueModule } from "../src/modules/league/league.module";
import { MemberModule } from "../src/modules/member/member.module";
import { NotificationModule } from "../src/modules/notification/notification.module";
import { OrganizationModule } from "../src/modules/organization/organization.module";
import { OrganizationConfigModule } from "../src/modules/organization-config/organization-config.module";
import { PointsModule } from "../src/modules/points/points.module";
import { ProjectModule } from "../src/modules/project/project.module";
import { ProjectDiaryModule } from "../src/modules/project-diary/project-diary.module";
import { ProjectPlanningModule } from "../src/modules/project-planning/project-planning.module";
import { TaskModule } from "../src/modules/task/task.module";
import { TaskManagerModule } from "../src/modules/task-manager/task-manager.module";
import { TaskTemplateModule } from "../src/modules/task-template/task-template.module";
import { TaskUpdateModule } from "../src/modules/task-update/task-update.module";
import { TeamModule } from "../src/modules/team/team.module";
import { UserModule } from "../src/modules/user/user.module";
import { TestAuthModule } from "./mocks/auth.module";

// Mock services
const mockEmailService = {
  sendWelcomeEmail: async () => true,
  sendPasswordResetEmail: async () => true,
  sendVerificationEmail: async () => true,
  sendEmail: async () => true,
};

const mockSmsService = {
  sendSms: async () => true,
  sendVerificationCode: async () => true,
};

const mockS3Service = {
  uploadFile: async () => ({
    url: "https://test.s3.com/file.jpg",
    key: "file.jpg",
  }),
  deleteFile: async () => true,
  getSignedUrl: async () => "https://test.s3.com/signed",
};

const mockPushNotificationService = {
  sendPushNotification: async () => true,
  subscribeToTopic: async () => true,
  unsubscribeFromTopic: async () => true,
};

@Module({})
export class TestAppModule {
  static forRoot(): DynamicModule {
    return {
      module: TestAppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
        }),
        DatabaseModule,
        PassportModule.register({ defaultStrategy: "jwt" }),
        JwtModule.register({
          secret: process.env.JWT_SECRET || "test_secret",
          signOptions: { expiresIn: "1d" },
        }),
        // Feature modules
        TestAuthModule,
        GameModule,
        UserModule,
        OrganizationModule,
        OrganizationConfigModule,
        MemberModule,
        TeamModule,
        NotificationModule,
        ProjectModule,
        ProjectDiaryModule,
        ProjectPlanningModule,
        KaizenModule,
        KaizenIdeaModule,
        KaizenTypeModule,
        JobRoleModule,
        LeagueModule,
        TaskModule,
        TaskManagerModule,
        TaskTemplateModule,
        TaskUpdateModule,
        PointsModule,
        FinancialPrizeModule,
        ImageModule,
        KpiModule,
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => process.env[key],
          },
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: SmsService,
          useValue: mockSmsService,
        },
        {
          provide: S3Service,
          useValue: mockS3Service,
        },
        {
          provide: PushNotificationService,
          useValue: mockPushNotificationService,
        },
      ],
      exports: [ConfigService],
    };
  }
}
