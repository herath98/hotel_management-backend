// migrations/createUsersTable.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function createUsersTable() {
  try {
    // First create the sequence if it doesn't exist
    await pool.query(`
      CREATE SEQUENCE IF NOT EXISTS users_id_seq
      INCREMENT 1
      START 1
      MINVALUE 1
      MAXVALUE 2147483647
      CACHE 1;
    `);

    // Create trigger functions
    await pool.query(`
      CREATE OR REPLACE FUNCTION public.update_last_login()
      RETURNS trigger AS $$ 
      BEGIN
        NEW.last_login = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      CREATE OR REPLACE FUNCTION public.update_updated_at_column()
      RETURNS trigger AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.users
      (
        id integer NOT NULL DEFAULT nextval('users_id_seq'::regclass),
        username character varying(50) NOT NULL,
        password character varying(255) NOT NULL,
        created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        role character varying(10) NOT NULL DEFAULT 'staff',
        updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
        last_login timestamp without time zone,
        firstname character varying(255),
        lastname character varying(255),
        email character varying(255),
        mobile character varying(15),
        address text,
        hourly_rate numeric(10,2),
        CONSTRAINT users_pkey PRIMARY KEY (id),
        CONSTRAINT users_username_key UNIQUE (username),
        CONSTRAINT users_role_check CHECK (role::text = ANY (ARRAY['staff', 'admin', 'manager', 'guest']::text[]))
      );
    `);

    // Create triggers
    await pool.query(`
      CREATE OR REPLACE TRIGGER set_last_login
        BEFORE UPDATE 
        ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.update_last_login();
    `);

    await pool.query(`
      CREATE OR REPLACE TRIGGER set_updated_at
        BEFORE UPDATE 
        ON public.users
        FOR EACH ROW
        EXECUTE FUNCTION public.update_updated_at_column();
    `);

    console.log('Users table and triggers created successfully');
  } catch (error) {
    console.error('Error creating users table:', error);
  } finally {
    await pool.end();
  }
}

createUsersTable();