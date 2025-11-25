import { HttpExceptionFilter } from "@common/filters/http-exception.filter";
import { TransformInterceptor } from "@common/interceptors/transform.interceptor";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  // Set global prefix
  app.setGlobalPrefix("api/v1");

  // Enable validation pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Apply global filters and interceptors
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle("Construgame API")
    .setDescription(
      "Construgame API - Monolith Architecture with NestJS and Drizzle ORM",
    )
    .setVersion("1.0")
    .addTag("health", "Health check endpoints")
    .addTag("auth", "Authentication endpoints")
    .addTag("games", "Game management endpoints")
    .addTag("users", "User management endpoints")
    .addTag("organizations", "Organization management endpoints")
    .addTag("tasks", "Task management endpoints")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter JWT token",
        in: "header",
      },
      "JWT-auth",
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: "alpha",
      operationsSorter: "alpha",
    },
  });

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`🏥 Health check: http://localhost:${port}/api/v1/health\n`);
}

bootstrap();
