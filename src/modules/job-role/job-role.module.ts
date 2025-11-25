import { DatabaseModule } from "@infrastructure/database/database.module";
import { JobRoleRepository } from "@infrastructure/repositories/job-role.repository";
import { Module } from "@nestjs/common";
import { JobRoleController } from "./job-role.controller";
import { JobRoleService } from "./job-role.service";

@Module({
  imports: [DatabaseModule],
  controllers: [JobRoleController],
  providers: [
    JobRoleService,
    {
      provide: "IJobRoleRepository",
      useClass: JobRoleRepository,
    },
  ],
  exports: [JobRoleService],
})
export class JobRoleModule {}
