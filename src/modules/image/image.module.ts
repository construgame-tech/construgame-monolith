import { S3ImageStorageRepository } from "@infrastructure/repositories/s3-image-storage.repository";
import { StorageModule } from "@infrastructure/services/storage/storage.module";
import { Module } from "@nestjs/common";
import { ImageController } from "./image.controller";
import { ImageService } from "./image.service";

@Module({
  imports: [StorageModule],
  controllers: [ImageController],
  providers: [
    ImageService,
    {
      provide: "IImageStorageRepository",
      useClass: S3ImageStorageRepository,
    },
  ],
  exports: [ImageService],
})
export class ImageModule {}
