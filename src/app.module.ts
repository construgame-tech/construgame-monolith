import { DatabaseModule } from "@infrastructure/database/database.module";
import { EmailModule } from "@infrastructure/services/email/email.module";
import { PushNotificationModule } from "@infrastructure/services/notification/push.module";
import { SmsModule } from "@infrastructure/services/sms/sms.module";
import { StorageModule } from "@infrastructure/services/storage/storage.module";
import { AuthModule } from "@modules/auth/auth.module";
import { FinancialPrizeModule } from "@modules/financial-prize/financial-prize.module";
import { GameModule } from "@modules/game/game.module";
import { ImageModule } from "@modules/image/image.module";
import { JobRoleModule } from "@modules/job-role/job-role.module";
import { KaizenModule } from "@modules/kaizen/kaizen.module";
import { KaizenIdeaModule } from "@modules/kaizen-idea/kaizen-idea.module";
import { KaizenTypeModule } from "@modules/kaizen-type/kaizen-type.module";
import { KpiModule } from "@modules/kpi/kpi.module";
import { LeagueModule } from "@modules/league/league.module";
import { MemberModule } from "@modules/member/member.module";
import { NotificationModule } from "@modules/notification/notification.module";
import { OrganizationModule } from "@modules/organization/organization.module";
import { OrganizationConfigModule } from "@modules/organization-config/organization-config.module";
import { PointsModule } from "@modules/points/points.module";
import { ProjectModule } from "@modules/project/project.module";
import { ProjectDiaryModule } from "@modules/project-diary/project-diary.module";
import { ProjectPlanningModule } from "@modules/project-planning/project-planning.module";
import { TaskModule } from "@modules/task/task.module";
import { TaskManagerModule } from "@modules/task-manager/task-manager.module";
import { TaskTemplateModule } from "@modules/task-template/task-template.module";
import { TaskUpdateModule } from "@modules/task-update/task-update.module";
import { TeamModule } from "@modules/team/team.module";
import { UserModule } from "@modules/user/user.module";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";

@Module({
  imports: [
    // Load environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === "test" ? ".env.test" : ".env",
      ignoreEnvFile: process.env.NODE_ENV === "test",
    }),

    // Database configuration
    DatabaseModule,
    EmailModule,

    // Feature modules
    GameModule,
    UserModule,
    OrganizationModule,
    OrganizationConfigModule,
    MemberModule,
    TeamModule,
    NotificationModule,
    ProjectModule,
    ProjectDiaryModule,
    KaizenModule,
    KaizenIdeaModule,
    KaizenTypeModule,
    JobRoleModule,
    LeagueModule,
    KpiModule,
    FinancialPrizeModule,
    PointsModule,
    ImageModule,
    TaskModule,
    TaskManagerModule,
    TaskTemplateModule,
    TaskUpdateModule,
    ProjectPlanningModule,
    AuthModule,
    // Infrastructure services
    StorageModule,
    SmsModule,
    PushNotificationModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
