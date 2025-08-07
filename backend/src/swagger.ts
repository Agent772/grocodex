import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Grocodex API',
    version: '1.0.0',
    description: 'API documentation for Grocodex backend',
  },
  servers: [
    {
      url: '/api',
      description: 'Local API',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts'], // JSDoc comments in route files
};

export const swaggerSpec = swaggerJSDoc(options);
