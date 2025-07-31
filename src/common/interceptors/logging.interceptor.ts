import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { extractIP } from '../utils/ip.util';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
	private readonly logger = new Logger('RequestLogger');

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const req = context.switchToHttp().getRequest() as Request;
		const res = context.switchToHttp().getResponse<Response>();
		const { method, originalUrl } = req;
		const start = Date.now();

		return next.handle().pipe(
			tap(() => {
				const duration = Date.now() - start;
				const ip = extractIP(req);
				this.logger.log(`${ip} - ${method} ${originalUrl} ${res.statusCode} ${duration}ms`);

				if (originalUrl.includes('/health')) return;

				// TODO: log to ELK
			})
		);
	}
}
