import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { ImageService } from "./image.service";

@ApiTags("images")
@UseGuards(JwtAuthGuard)
@Controller()
export class ImageController {
  constructor(
    @Inject(ImageService)
    private readonly imageService: ImageService,
  ) {}

  @Get("organizations/:organizationId/presigned-url")
  @ApiOperation({ summary: "Generate presigned URL for file upload" })
  @ApiQuery({ name: "fileName", required: true, type: String })
  @ApiQuery({ name: "fileType", required: true, type: String })
  @ApiQuery({ name: "imageType", required: false, enum: ["image", "file"] })
  async generatePresignedUrl(
    @Param("organizationId") organizationId: string,
    @Query("fileName") fileName: string,
    @Query("fileType") fileType: string,
    @Query("imageType") imageType?: "image" | "file",
  ) {
    return this.imageService.generatePresignedUrl(
      organizationId,
      fileName,
      fileType,
      imageType || "image",
    );
  }

  @Delete("files/:key")
  @HttpCode(204)
  @ApiOperation({ summary: "Delete a file from storage" })
  async deleteFile(@Param("key") key: string) {
    await this.imageService.deleteFile(key);
    return { message: "File deleted successfully" };
  }

  @Get("files/:key/exists")
  @ApiOperation({ summary: "Check if a file exists" })
  async fileExists(@Param("key") key: string) {
    const exists = await this.imageService.fileExists(key);
    return { exists };
  }
}
