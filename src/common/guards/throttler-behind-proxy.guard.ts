import { Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';
import { Request } from 'express';
import { extractIP } from '../utils/ip.util';

@Injectable()
export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
	private readonly logger: Logger = new Logger(ThrottlerBehindProxyGuard.name);

	constructor(options: ThrottlerModuleOptions, storageService: ThrottlerStorage, reflector: Reflector) {
		super(options, storageService, reflector);
	}

	protected getTracker = async (req: Request): Promise<string> => {
		const ip = extractIP(req);
		this.logger.debug(`Extracted IP: ${ip}`);
		return ip;
	};
}
