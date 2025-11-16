import { config } from 'dotenv';
import { resolve } from 'path';

export default async function globalSetup() {
  // Load .env.test environment variables
  config({ path: resolve(__dirname, '../.env.test') });
  
  console.log('✓ Global setup: Loaded .env.test environment variables');
}


