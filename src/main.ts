import { HttpExceptionFilter } from "@common/filters/http-exception.filter";
import { TransformInterceptor } from "@common/interceptors/transform.interceptor";
import helmet from "@fastify/helmet";
import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Security: Helmet (configured for Swagger compatibility)
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [`'self'`],
        styleSrc: [`'self'`, `'unsafe-inline'`],
        imgSrc: [`'self'`, "data:", "validator.swagger.io"],
        scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
      },
    },
  });

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

  const documentFactory = () =>
    SwaggerModule.createDocument(app as unknown as INestApplication, config);
  SwaggerModule.setup(
    "docs",
    app as unknown as INestApplication,
    documentFactory,
    {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
      jsonDocumentUrl: "docs/json",
      yamlDocumentUrl: "docs/yaml",
    },
  );

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port, "0.0.0.0");

  console.log(`\n🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`🏥 Health check: http://localhost:${port}/api/v1/health\n`);
}

bootstrap();
