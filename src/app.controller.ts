import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("health")
@Controller()
export class AppController {
  @Get("health")
  @ApiOperation({ summary: "Health check endpoint" })
  @ApiResponse({
    status: 200,
    description: "Service is healthy",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        message: { type: "string", example: "Construgame API is running" },
        timestamp: { type: "string", example: "2024-01-01T00:00:00.000Z" },
        uptime: { type: "number", example: 123.456 },
        environment: { type: "string", example: "development" },
        version: { type: "string", example: "1.0.0" },
      },
    },
  })
  getHealth() {
    return {
      status: "ok",
      message: "Construgame API is running",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
      version: "1.0.0",
    };
  }

  @Get("info")
  @ApiOperation({ summary: "Get API information" })
  @ApiResponse({
    status: 200,
    description: "API information",
    schema: {
      type: "object",
      properties: {
        name: { type: "string", example: "Construgame API" },
        description: { type: "string", example: "API description" },
        version: { type: "string", example: "1.0.0" },
        documentation: { type: "string", example: "/docs" },
      },
    },
  })
  getInfo() {
    return {
      name: "Construgame API",
      description:
        "Construgame API - Monolith Architecture with NestJS and Drizzle ORM",
      version: "1.0.0",
      documentation: "/docs",
    };
  }
}
