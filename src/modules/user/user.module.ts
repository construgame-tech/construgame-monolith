import { DatabaseModule } from "@infrastructure/database/database.module";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { UserRepository } from "@infrastructure/repositories/user.repository";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { UserOrganizationController } from "./user-organization.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [UserController, UserOrganizationController],
  providers: [
    UserService,
    UserRepository,
    MemberRepository,
    OrganizationRepository,
  ],
  exports: [UserRepository, UserService, MemberRepository],
})
export class UserModule {}
