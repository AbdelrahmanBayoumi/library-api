import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
	constructor(private configService: ConfigService) {}

	createTypeOrmOptions(): TypeOrmModuleOptions {
		return {
			type: 'postgres',
			url: this.configService.get('DATABASE_URL'),
			synchronize: this.configService.get<boolean>('DATABASE_SYNCHRONIZE', { infer: true }),
			dropSchema: false,
			keepConnectionAlive: true,
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
