/**
 * Main entry point for the NestJS application.
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

/**
 * Bootstraps the NestJS application.
 * Sets up validation, Swagger, and starts the server.
 */
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Enable global validation for all DTOs and request bodies
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip properties that do not have decorators
        forbidNonWhitelisted: true, // Throw error if unknown properties are present
        transform: true, // Automatically transform payloads to DTO instances
        forbidUnknownValues: true, // Forbid unknown values in validation
    }));

    // Configure Swagger/OpenAPI documentation
    const config = new DocumentBuilder()
        .setTitle('User API')
        .setDescription('CRUD API for User entity')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);

    // Serve Swagger UI at /api
    SwaggerModule.setup('api', app, document, {
        customSiteTitle: 'User API Swagger',
        // ...existing code...
        customfavIcon: '',
        swaggerOptions: {
            persistAuthorization: true
        },
        customJs: '',
    });

    // Serve raw OpenAPI spec at /api/docs for external tools and validation
    app.use('/api/docs', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(document);
    });

    // Start the HTTP server on port 3000
    await app.listen(3000);
}
bootstrap();
