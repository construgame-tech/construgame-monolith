import { DatabaseModule } from "@infrastructure/database/database.module";
import { MemberRepository } from "@infrastructure/repositories/member.repository";
import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { MemberController } from "./member.controller";
import { MemberService } from "./member.service";

@Module({
  imports: [DatabaseModule, UserModule],
  controllers: [MemberController],
  providers: [
    MemberService,
    MemberRepository,
    {
      provide: "IMemberRepository",
      useClass: MemberRepository,
    },
  ],
  exports: [MemberService, MemberRepository],
})
export class MemberModule {}
