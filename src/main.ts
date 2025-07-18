/**
 * Main entry point for the NestJS Expense Tracker application.
 * - Sets up global validation for all incoming requests.
 * - Configures Swagger UI and raw OpenAPI spec endpoints.
 * - Starts the HTTP server.
 *
 * This file should remain minimal and only handle app-wide configuration.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

/**
 * Bootstraps the NestJS application.
 * Sets up validation, Swagger, and starts the server.
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS for frontend integration
    app.enableCors({
        origin: true, // Allow all origins for development
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Enable global validation for all DTOs and request bodies
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip properties that do not have decorators
        forbidNonWhitelisted: true, // Throw error if unknown properties are present
        transform: true, // Automatically transform payloads to DTO instances
        forbidUnknownValues: true, // Forbid unknown values in validation
    }));

    // Add logging interceptor for debugging
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Configure Swagger/OpenAPI documentation
    const config = new DocumentBuilder()
        .setTitle('Expense Tracker API')
        .setDescription('RESTful API for managing expenses with authentication')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);

    // Serve Swagger UI at /api
    SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'Expense Tracker API',
        customfavIcon: '',
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            displayRequestDuration: true,
        },
        customJs: '',
        customCssUrl: '',
    });

    // Serve raw OpenAPI spec at /api/docs for external tools and validation
    app.use('/api/docs', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(document);
    });

    // Start the HTTP server on port 3000
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🚀 Expense Tracker API is running on http://localhost:${port}`);
    console.log(`📚 Swagger documentation available at http://localhost:${port}/api`);
}
bootstrap();
