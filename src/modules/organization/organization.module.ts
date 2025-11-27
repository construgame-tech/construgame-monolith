import { DatabaseModule } from "@infrastructure/database/database.module";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { OrgConfigRepository } from "@infrastructure/repositories/org-config.repository";
import { OrgKaizenConfigRepository } from "@infrastructure/repositories/org-kaizen-config.repository";
import { OrganizationRepository } from "@infrastructure/repositories/organization.repository";
import { Module } from "@nestjs/common";
import { OrganizationController } from "./organization.controller";
import { OrganizationListController } from "./organization-list.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [OrganizationController, OrganizationListController],
  providers: [
    OrganizationRepository,
    OrgConfigRepository,
    MemberRepository,
    OrgKaizenConfigRepository,
  ],
  exports: [
    OrganizationRepository,
    OrgConfigRepository,
    MemberRepository,
    OrgKaizenConfigRepository,
  ],
})
export class OrganizationModule {}
