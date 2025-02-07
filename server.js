import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerDocs from './src/config/swagger.js';
import pool from './src/config/database.js';
import userRoutes from './src/routes/userRoutes.js';
import roomRoutes from './src/routes/roomRoutes.js';
import guestRoutes from './src/routes/guestRoutes.js';
import payrollRoutes from './src/routes/payrollRoutes.js';
import bookingRoutes from './src/routes/bookingRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import housekeepingRoutes from './src/routes/housekeepingRoutes.js';
import './src/jobs/taskStatusUpdater.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Restrict to specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: false // Set to false since credentials cannot be used with '*'
}));


// Middleware
app.use(express.json()); // Parse incoming JSON requests



// API Routes
app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', guestRoutes);
app.use('/api', payrollRoutes);
app.use('/api', bookingRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', housekeepingRoutes);

// Swagger documentation setup
swaggerDocs(app);

// Test database connection
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`);
});
