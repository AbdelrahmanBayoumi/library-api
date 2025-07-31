import { ClassSerializerInterceptor, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { join } from 'path';

import { AppModule } from './app.module';
import { Env } from './common/enums';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

function setupSwagger(app: NestExpressApplication) {
	const swaggerOptions = new DocumentBuilder()
		.setTitle('Library API')
		.setDescription('REST API for Library')
		.setVersion('1.0')
		.build();

	const document = SwaggerModule.createDocument(app, swaggerOptions);
	SwaggerModule.setup('docs', app, document);
}

async function bootstrap() {
	const app: NestExpressApplication = await NestFactory.create(AppModule);

	app.use(helmet()); // Use helmet for security headers
	app.enableCors(); // Enable CORS for all origins

	// Serve static files from the 'public' directory at project root
	app.useStaticAssets(join(__dirname, '..', 'public'));

	// Initialize Error Handler
	app.useGlobalFilters(new GlobalExceptionFilter());
	app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
	app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
	app.enableShutdownHooks();

	if (process.env.NODE_ENV === Env.development) setupSwagger(app);

	const PORT = process.env.PORT || 3000;
	await app.listen(PORT);

	// Log current url of app
	const logger = new Logger('Main');
	logger.log(`Listening to http://localhost:${PORT}`);
	if (process.env.NODE_ENV === Env.development) logger.log(`Swagger UI: http://localhost:${PORT}/docs`);
}

bootstrap();
