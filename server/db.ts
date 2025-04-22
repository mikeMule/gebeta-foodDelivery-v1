import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon with the WebSocket constructor
neonConfig.webSocketConstructor = ws;

// Add more robust connection handling
neonConfig.useSecureWebSocket = true; // Ensure secure WebSocket connection
neonConfig.pipelineTLS = true; // Optimize TLS pipeline

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with more robust configuration
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection couldn't be established
});

// Add event listeners for better debugging
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });