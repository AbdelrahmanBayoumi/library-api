import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			type: 'postgres',
			host: this.configService.get<string>('DATABASE_HOST', { infer: true }),
			port: this.configService.get<number>('DATABASE_PORT', { infer: true }),
			username: this.configService.get<string>('DATABASE_USERNAME', { infer: true }),
			password: this.configService.get<string>('DATABASE_PASSWORD', { infer: true }),
			database: this.configService.get<string>('DATABASE_NAME', { infer: true }),
			synchronize: false,
			dropSchema: false,
			keepConnectionAlive: true,
			ssl: this.configService.get<boolean>('DATABASE_SSL', { infer: true })
				? { rejectUnauthorized: true }
				: false,
			logging: this.configService.get<boolean>('DATABASE_LOGGING', { infer: true }),
			entities: [__dirname + '/../**/*.entity{.ts,.js}'],
			migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
			cli: {
				entitiesDir: 'src',
				migrationsDir: 'src/database/migrations',
				seedsDir: 'src/database/seeds',
			},
		} as TypeOrmModuleOptions;
	}
}
