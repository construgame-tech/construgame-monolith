import { DatabaseModule } from "@infrastructure/database/database.module";
import { WebNotificationRepository } from "@infrastructure/repositories/web-notification.repository";
import { Module } from "@nestjs/common";
import { NotificationController } from "./notification.controller";
import { NotificationService } from "./notification.service";
import { NotificationOrgController } from "./notification-org.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [NotificationController, NotificationOrgController],
  providers: [
    NotificationService,
    {
      provide: "IWebNotificationRepository",
      useClass: WebNotificationRepository,
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
