import { Module } from "@nestjs/common";
import { ImageController } from "../../src/modules/image/image.controller";
import { ImageService } from "../../src/modules/image/image.service";

// Mock do repositório S3
const mockImageStorageRepository = {
  upload: async () => ({
    url: "https://test.s3.com/image.jpg",
    key: "image.jpg",
  }),
  delete: async () => true,
  getSignedUrl: async () => "https://test.s3.com/signed",
  exists: async () => true,
};

@Module({
  controllers: [ImageController],
  providers: [
    ImageService,
    {
      provide: "IImageStorageRepository",
      useValue: mockImageStorageRepository,
    },
  ],
  exports: [ImageService],
})
export class TestImageModule {}
