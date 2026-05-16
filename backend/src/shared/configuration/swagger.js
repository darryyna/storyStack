const swaggerJSDoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StoryStack API',
      version: '1.0.0',
      description: 'Full documentation of StoryStack backend endpoints',
    },
    servers: [{
      url: 'http://localhost:3000',
      description: 'Development server',
    }],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT access token. Use format **Bearer <token>**',
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication and user management' },
      { name: 'Books', description: 'Search external books, manage personal library and recommendations' },
      { name: 'Goals', description: 'Reading goals CRUD and AI predictions' },
      { name: 'Statistics', description: 'Reading statistics, activity and insights' },
      { name: 'Folders', description: 'Folder CRUD and book organization' },
    ],
  },
  apis: [
    path.join(__dirname, '../routes/*.js'),
    path.join(__dirname, '../controllers/*.js'),
  ],
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;

