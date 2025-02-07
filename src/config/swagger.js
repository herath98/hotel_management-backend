import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Hotel Management System',
            version: '1.0.0',
            description: 'API documentation for the Hotel Management System',
        },
        servers: [{
            url: '/api',
            description: 'API base path'
        }]
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJSDoc(options);

export default function swaggerDocs(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}