import {
  ArgumentMetadata,
  ValidationPipe as NestValidationPipe,
} from "@nestjs/common";

export class CustomValidationPipe extends NestValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    console.log("🔍 ValidationPipe.transform called!");
    console.log("  - value:", JSON.stringify(value));
    console.log("  - metadata:", metadata);

    try {
      const result = await super.transform(value, metadata);
      console.log("  - validation passed, result:", result);
      return result;
    } catch (error) {
      console.log("  - validation FAILED:", error);
      throw error;
    }
  }
}
