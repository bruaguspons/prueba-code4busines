import { execSync } from 'child_process';
import { unlink } from 'fs/promises';
import path from 'path';

const TEST_DB_URL = 'file:./prisma/test.db';
const TEST_DB_PATH = path.resolve(__dirname, '../prisma/test.db');

export async function setup() {
  execSync('npx prisma db push --force-reset --skip-generate', {
    cwd: path.resolve(__dirname, '..'),
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: 'inherit',
  });
}

export async function teardown() {
  try {
    await unlink(TEST_DB_PATH);
  } catch {
    // ignore if file doesn't exist
  }
}
