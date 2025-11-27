import { JwtAuthGuard } from "@modules/auth/jwt-auth.guard";
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ImageService } from "./image.service";

@ApiTags("files")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller()
export class ImageController {
  constructor(
    @Inject(ImageService)
    private readonly imageService: ImageService,
  ) {}

  @Get("organization/:organizationId/presigned-url")
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

  // OpenAPI compatible routes
  @Post("image/bucket/presigned-url")
  @ApiOperation({ summary: "Create image upload presigned URL" })
  @ApiQuery({
    name: "extension",
    required: true,
    enum: ["png", "jpeg", "jpg", "webp"],
    description: "Image file extension",
  })
  @ApiResponse({
    status: 200,
    description: "Presigned URL created",
    schema: {
      type: "object",
      properties: {
        url: { type: "string" },
      },
    },
  })
  async createImagePresignedUrl(
    @Query("extension") extension: string,
  ): Promise<{ url: string }> {
    const validExtensions = ["png", "jpeg", "jpg", "webp"];
    if (!extension || !validExtensions.includes(extension.toLowerCase())) {
      throw new BadRequestException(
        `Invalid extension. Must be one of: ${validExtensions.join(", ")}`,
      );
    }

    const fileName = `upload-${Date.now()}.${extension}`;
    const result = await this.imageService.generatePresignedUrl(
      "global", // Default organization for global uploads
      fileName,
      `image/${extension === "jpg" ? "jpeg" : extension}`,
      "image",
    );

    return { url: result.url };
  }

  @Post("file/bucket/presigned-url")
  @ApiOperation({ summary: "Create file upload presigned URL" })
  @ApiQuery({
    name: "extension",
    required: true,
    description: "File extension",
  })
  @ApiResponse({
    status: 200,
    description: "Presigned URL created",
    schema: {
      type: "object",
      properties: {
        url: { type: "string" },
      },
    },
  })
  async createFilePresignedUrl(
    @Query("extension") extension: string,
  ): Promise<{ url: string }> {
    if (!extension) {
      throw new BadRequestException("Extension is required");
    }

    const fileName = `upload-${Date.now()}.${extension}`;
    const contentType = this.getContentType(extension);

    const result = await this.imageService.generatePresignedUrl(
      "global",
      fileName,
      contentType,
      "file",
    );

    return { url: result.url };
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

  private getContentType(extension: string): string {
    const contentTypes: Record<string, string> = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xls: "application/vnd.ms-excel",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ppt: "application/vnd.ms-powerpoint",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      txt: "text/plain",
      csv: "text/csv",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
    };

    return contentTypes[extension.toLowerCase()] || "application/octet-stream";
  }
}
