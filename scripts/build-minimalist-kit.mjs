#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const designExportDir = path.join(projectRoot, 'design-export');
const distDir = path.join(projectRoot, 'dist');
const outputZip = path.join(distDir, 'minimalist-design-kit.zip');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Files to include in the kit
const filesToInclude = [
  'tailwind.config.js',
  'postcss.config.js',
  'index.css',
  'App.css',
  'DESIGN_SYSTEM.md',
  'COLORS.md',
  'README.md',
  'EXAMPLES.jsx',
  'package-dependencies.json',
  '.vscode/settings.json'
];

console.log('📦 Building Minimalist Design Kit...\n');

// Create zip archive
const output = fs.createWriteStream(outputZip);
const archive = archiver('zip', {
  zlib: { level: 9 } // Maximum compression
});

output.on('close', () => {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`✅ Build complete!`);
  console.log(`📦 Archive: ${outputZip}`);
  console.log(`📊 Size: ${sizeInMB} MB`);
  console.log(`\n✨ The minimalist design kit is ready to share!`);
});

archive.on('error', (err) => {
  console.error('❌ Archive error:', err);
  process.exit(1);
});

archive.pipe(output);

// Add files to archive
let filesAdded = 0;
let filesSkipped = 0;

filesToInclude.forEach((file) => {
  const filePath = path.join(designExportDir, file);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    if (stats.isFile()) {
      archive.file(filePath, { name: file });
      filesAdded++;
      console.log(`  ✓ Added: ${file}`);
    } else if (stats.isDirectory()) {
      archive.directory(filePath, file);
      filesAdded++;
      console.log(`  ✓ Added directory: ${file}`);
    }
  } else {
    filesSkipped++;
    console.log(`  ⚠ Skipped (not found): ${file}`);
  }
});

// Finalize the archive
archive.finalize();
