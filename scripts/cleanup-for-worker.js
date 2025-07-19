#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Cleanup script for Cloudflare Workers deployment
 * Removes image directories from dist to create a clean deployment package
 */

function getDirectorySize(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return { size: 0, fileCount: 0 };
  }

  let totalSize = 0;
  let fileCount = 0;

  function calculateSize(currentPath) {
    const stats = fs.statSync(currentPath);
    
    if (stats.isDirectory()) {
      const files = fs.readdirSync(currentPath);
      files.forEach(file => {
        calculateSize(path.join(currentPath, file));
      });
    } else {
      totalSize += stats.size;
      fileCount++;
    }
  }

  try {
    calculateSize(dirPath);
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not calculate size for ${dirPath}: ${error.message}`));
  }

  return { size: totalSize, fileCount };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function removeImagesFromDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      console.log(chalk.gray(`📁 Directory doesn't exist: ${path.basename(dirPath)}/`));
      return { size: 0, fileCount: 0 };
    }

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.avif'];
    let removedSize = 0;
    let removedCount = 0;
    let keptJsonCount = 0;

    // Process each subdirectory in album/artist
    const subdirs = fs.readdirSync(dirPath);
    
    subdirs.forEach(subdir => {
      const subdirPath = path.join(dirPath, subdir);
      const stats = fs.statSync(subdirPath);
      
      if (stats.isDirectory()) {
        const files = fs.readdirSync(subdirPath);
        
        files.forEach(file => {
          const filePath = path.join(subdirPath, file);
          const fileStats = fs.statSync(filePath);
          const ext = path.extname(file).toLowerCase();
          
          if (imageExtensions.includes(ext)) {
            // Remove image file
            removedSize += fileStats.size;
            removedCount++;
            fs.unlinkSync(filePath);
          } else if (ext === '.json') {
            // Keep JSON file
            keptJsonCount++;
          }
        });
      }
    });

    console.log(chalk.green(`🗑️  Cleaned ${path.basename(dirPath)}/: removed ${removedCount} images, kept ${keptJsonCount} JSON files (${formatBytes(removedSize)})`));
    return { size: removedSize, fileCount: removedCount };

  } catch (error) {
    console.error(chalk.red(`❌ Failed to clean ${dirPath}:`), error.message);
    return { size: 0, fileCount: 0 };
  }
}

async function main() {
  // Get dist directory from command line argument or default to 'dist'
  const distDir = process.argv[2] || 'dist';
  
  console.log(chalk.blue('🧹 Cloudflare Workers Cleanup Tool\n'));
  console.log(chalk.blue(`Removing images while preserving JSON files from ${distDir} for Workers deployment...\n`));

  const distPath = path.join(process.cwd(), distDir);
  
  // Check if dist directory exists
  if (!fs.existsSync(distPath)) {
    console.error(chalk.red(`❌ ${distDir} directory not found. Run the build first.`));
    process.exit(1);
  }

  // Get initial dist size
  const initialSize = getDirectorySize(distPath);
  console.log(chalk.blue(`📁 Initial dist size: ${formatBytes(initialSize.size)} (${initialSize.fileCount} files)`));

  // Define directories to remove
  const dirsToCheck = [
    path.join(distPath, 'album'),
    path.join(distPath, 'artist')
  ];

  let totalRemoved = { size: 0, fileCount: 0 };

  // Check if image directories exist (they won't in worker build)
  const existingDirs = dirsToCheck.filter(dir => fs.existsSync(dir));
  
  if (existingDirs.length === 0) {
    console.log(chalk.blue('\n✅ No image directories found - worker build is already clean!'));
  } else {
    // Remove images but keep JSON files
    console.log(chalk.blue('\n🗑️  Removing images (keeping JSON files):'));
    existingDirs.forEach(dir => {
      const removed = removeImagesFromDirectory(dir);
      totalRemoved.size += removed.size;
      totalRemoved.fileCount += removed.fileCount;
    });
  }

  // Calculate final size
  const finalSize = getDirectorySize(distPath);
  
  // Print summary
  console.log(chalk.blue('\n📊 Cleanup Summary:'));
  console.log(chalk.white(`   Images removed: ${totalRemoved.fileCount}`));
  console.log(chalk.white(`   Space saved: ${formatBytes(totalRemoved.size)}`));
  console.log(chalk.white(`   Final dist size: ${formatBytes(finalSize.size)} (${finalSize.fileCount} files)`));
  console.log(chalk.green(`   JSON files preserved for Workers serving`));
  
  const reduction = initialSize.size > 0 ? ((totalRemoved.size / initialSize.size) * 100).toFixed(1) : 0;
  console.log(chalk.green(`   Size reduction: ${reduction}%`));

  // List remaining contents
  console.log(chalk.blue('\n📋 Remaining in dist/:'));
  try {
    const contents = fs.readdirSync(distPath);
    contents.forEach(item => {
      const itemPath = path.join(distPath, item);
      const stats = fs.statSync(itemPath);
      const icon = stats.isDirectory() ? '📁' : '📄';
      const size = stats.isDirectory() ? '' : ` (${formatBytes(stats.size)})`;
      console.log(chalk.gray(`   ${icon} ${item}${size}`));
    });
  } catch (error) {
    console.warn(chalk.yellow(`⚠️  Could not list dist contents: ${error.message}`));
  }

  console.log(chalk.green('\n✅ Cleanup completed! Ready for Workers deployment.'));
  console.log(chalk.blue('💡 Images will be served from R2 CDN in production.'));
}

// Handle errors
process.on('uncaughtException', (error) => {
  console.error(chalk.red('\n❌ Cleanup failed:'), error.message);
  process.exit(1);
});

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error(chalk.red('❌ Script failed:'), error.message);
    process.exit(1);
  });
}

export { main };