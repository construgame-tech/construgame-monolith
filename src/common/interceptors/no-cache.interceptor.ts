import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { Observable } from "rxjs";

/**
 * Interceptor que adiciona headers de segurança para controle de cache.
 *
 * Previne que proxies e navegadores armazenem respostas sensíveis em cache,
 * evitando vazamento de dados entre usuários que compartilham cache (ex: redes corporativas).
 *
 * Headers adicionados:
 * - Cache-Control: no-store, no-cache, must-revalidate, private
 * - Pragma: no-cache (compatibilidade HTTP/1.0)
 * - Expires: 0 (marca como expirado imediatamente)
 */
@Injectable()
export class NoCacheInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<FastifyReply>();

    // Headers para prevenir cache em proxies e navegadores
    response.header(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private",
    );
    response.header("Pragma", "no-cache");
    response.header("Expires", "0");

    return next.handle();
  }
}
