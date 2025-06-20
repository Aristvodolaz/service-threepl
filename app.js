// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const x3plRoutes = require('./routes/x3plRoutes');
const x3plService = require('./services/x3plService');

// Create Express app
const app = express();
const PORT =  3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Swagger UI route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use('/x3pl', x3plRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'X_Three_PL Service API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    errorCode: 404,
    value: {
      error: 'Route not found'
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({
    success: false,
    errorCode: 500,
    value: {
      error: 'Internal server error'
    }
  });
});

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database (create table if not exists)
    console.log('Initializing database...');
    await x3plService.initializeDatabase();
    console.log('Database initialized successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API documentation available at http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer(); 