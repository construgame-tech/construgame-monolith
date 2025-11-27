import { DatabaseModule } from "@infrastructure/database/database.module";
import { GameRepository } from "@infrastructure/repositories/game.repository";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { TaskRepository } from "@infrastructure/repositories/task.repository";
import { TaskUpdateRepository } from "@infrastructure/repositories/task-update.repository";
import { UserRepository } from "@infrastructure/repositories/user.repository";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserOrganizationController } from "./user-organization.controller";
import { UserRankingController } from "./user-ranking.controller";
import { UserSingularController } from "./user-singular.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [
    UserController,
    UserOrganizationController,
    UserRankingController,
    UserSingularController,
  ],
  providers: [
    UserService,
    UserRepository,
    MemberRepository,
    OrganizationRepository,
    TaskRepository,
    GameRepository,
    {
      provide: "TaskUpdateRepository",
      useClass: TaskUpdateRepository,
    },
  ],
  exports: [UserRepository, UserService, MemberRepository],
})
export class UserModule {}
