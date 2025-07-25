#!/usr/bin/env node

import { execSync } from 'child_process';
import { readdirSync, statSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function removeImagesFromDirectory(dirPath) {
  try {
    const items = readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = join(dirPath, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively process subdirectories
        removeImagesFromDirectory(fullPath);
        
        // Try to remove empty directories
        try {
          rmdirSync(fullPath);
          console.log(`Removed empty directory: ${fullPath}`);
        } catch (e) {
          // Directory not empty, skip
        }
      } else if (item.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
        // Remove image files
        unlinkSync(fullPath);
        console.log(`Removed image: ${fullPath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error.message);
  }
}

function runBuild() {
  console.log('Starting Cloudflare build process...');
  
  // Remove images from public/album and public/artist directories
  const albumPath = join(__dirname, '..', 'public', 'album');
  const artistPath = join(__dirname, '..', 'public', 'artist');
  
  console.log('Removing images to free up disk space...');
  
  try {
    console.log(`Cleaning album directory: ${albumPath}`);
    removeImagesFromDirectory(albumPath);
    console.log('Album directory cleaned successfully');
  } catch (error) {
    console.log('Album directory not found or already clean');
  }
  
  try {
    console.log(`Cleaning artist directory: ${artistPath}`);
    removeImagesFromDirectory(artistPath);
    console.log('Artist directory cleaned successfully');
  } catch (error) {
    console.log('Artist directory not found or already clean');
  }
  
  // Run the standard build process
  console.log('Running standard build process...');
  try {
    execSync('npm run build:fast', { stdio: 'inherit' });
    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error.message);
    process.exit(1);
  }
  
  // Run the worker build script
  console.log('Building worker...');
  try {
    execSync('node scripts/build-worker.js', { stdio: 'inherit' });
    console.log('Worker build completed successfully');
  } catch (error) {
    console.error('Worker build failed:', error.message);
    process.exit(1);
  }
}

runBuild(); 