import { config } from 'dotenv';
import { DataSource } from 'typeorm';

config();

export default new DataSource({
	type: 'postgres',
	host: process.env.DATABASE_HOST,
	port: parseInt(process.env.DATABASE_PORT, 10),
	username: process.env.DATABASE_USERNAME,
	password: process.env.DATABASE_PASSWORD,
	database: process.env.DATABASE_NAME,
	ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : false,
	entities: [__dirname + '/../**/*.entity{.ts,.js}'],
	migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
});
