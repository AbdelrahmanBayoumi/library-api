import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request } from 'express';

import { Env } from '../enums';
import { extractIP } from '../utils/ip.util';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(GlobalExceptionFilter.name);

	catch(exception: Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse();
		const request = ctx.getRequest() as Request;

		const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		const message = exception instanceof HttpException ? exception.getResponse() : 'Internal server error';
		const ip = extractIP(request);

		if (process.env.NODE_ENV !== Env.production) {
			console.error(exception);
		}
		this.logger.error(`${ip} - ${request.method} ${request.url} ${status}, Error: ${JSON.stringify(message)}`);
		// TODO log to ELK

		response.status(status).json({
			statusCode: status,
			timestamp: new Date().toISOString(),
			path: request.url,
			error: typeof message === 'string' ? message : message['message'],
		});
	}
}
