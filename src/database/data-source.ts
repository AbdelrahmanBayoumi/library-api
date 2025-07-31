import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
	type: 'postgres',
	host: process.env.DB_HOST || 'localhost',
	port: 5432,
	url: process.env.DATABASE_URL,
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
