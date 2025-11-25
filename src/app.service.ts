import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
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
