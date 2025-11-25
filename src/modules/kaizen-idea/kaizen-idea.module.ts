import { DatabaseModule } from "@infrastructure/database/database.module";
import { KaizenIdeaRepository } from "@infrastructure/repositories/kaizen-idea.repository";
import { Module } from "@nestjs/common";
import { KaizenIdeaController } from "./kaizen-idea.controller";
import { KaizenIdeaService } from "./kaizen-idea.service";

@Module({
  imports: [DatabaseModule],
  controllers: [KaizenIdeaController],
  providers: [
    KaizenIdeaService,
    {
      provide: "IKaizenIdeaRepository",
      useClass: KaizenIdeaRepository,
    },
  ],
  exports: [KaizenIdeaService],
})
export class KaizenIdeaModule {}
