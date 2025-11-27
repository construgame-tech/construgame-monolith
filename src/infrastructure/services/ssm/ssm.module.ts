import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SsmService } from "./ssm.service";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SsmService],
  exports: [SsmService],
})
export class SsmModule {}
