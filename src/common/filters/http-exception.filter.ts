import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let error = "Internal Server Error";
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === "object" &&
        exceptionResponse !== null
      ) {
        const responseObj = exceptionResponse as any;
        message = responseObj.message || message;
        error = responseObj.error || error;
        details = responseObj.details;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log the error
    this.logger.error(
      `HTTP ${status} Error - ${request.method} ${request.url}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    // Build error response
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message: Array.isArray(message) ? message : [message],
      ...(details && { details }),
    };

    response.status(status).json(errorResponse);
  }
}
