import { DatabaseModule } from "@infrastructure/database/database.module";
import { UserRepository } from "@infrastructure/repositories/user.repository";
import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";

@Module({
  imports: [DatabaseModule],
  controllers: [UserController],
  providers: [UserRepository],
  exports: [UserRepository],
})
export class UserModule {}
