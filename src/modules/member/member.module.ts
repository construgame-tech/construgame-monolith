import { DatabaseModule } from "@infrastructure/database/database.module";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { Module } from "@nestjs/common";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";

@Module({
  imports: [DatabaseModule],
  controllers: [MemberController],
  providers: [
    MemberService,
    {
      provide: "IMemberRepository",
      useClass: MemberRepository,
    },
  ],
  exports: [MemberService],
})
export class MemberModule {}
