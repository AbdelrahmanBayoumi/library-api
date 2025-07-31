import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler-behind-proxy.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { BooksModule } from './modules/books/books.module';
import { BorrowersModule } from './modules/borrowers/borrowers.module';
import { BorrowingsModule } from './modules/borrowings/borrowings.module';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		ThrottlerModule.forRoot([
			{
				ttl: 60_000, // 1 minute
				limit: 30, // 30 requests per minute
			},
		]),
		TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
		BooksModule,
		BorrowersModule,
		BorrowingsModule,
	],
	controllers: [AppController],
	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: LoggingInterceptor,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: TimeoutInterceptor,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerBehindProxyGuard,
		},
	],
})
export class AppModule {}
