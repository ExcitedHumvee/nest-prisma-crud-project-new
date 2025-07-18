import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Logging interceptor to help debug request issues
 * This will log all incoming requests to help identify what's happening
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, headers } = request;
    
    // Log the request details
    this.logger.log(`${method} ${url}`);
    
    // Log if Authorization header is present
    if (headers.authorization) {
      this.logger.log(`Authorization header present: ${headers.authorization.substring(0, 20)}...`);
    } else {
      this.logger.warn('No Authorization header present');
    }

    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.log(`${method} ${url} - ${Date.now() - now}ms`);
      }),
    );
  }
}
