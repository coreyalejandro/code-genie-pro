#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const backendDir = path.join(projectRoot, 'backend');
const requirementsFile = path.join(backendDir, 'requirements.txt');

console.log('🔧 Setting up backend dependencies...\n');

try {
  console.log('📦 Installing Python dependencies...\n');
  execSync(`cd ${backendDir} && pip install -r requirements.txt`, {
    stdio: 'inherit',
    cwd: backendDir
  });
  
  console.log('\n✅ Backend dependencies installed successfully!\n');
  
} catch (error) {
  console.error('\n❌ Error installing dependencies:', error.message);
  process.exit(1);
}

