import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false, // Disable SSL for non-SSL-supported PostgreSQL servers
});

pool.connect()
    .then(() => console.log('Database connected!'))
    .catch(err => console.error('Database connection failed:', err));

export default pool;
