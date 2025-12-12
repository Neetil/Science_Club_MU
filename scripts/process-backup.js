/**
 * Script to process old backup files and remove base64 images
 * This reduces backup file size by removing base64 image data
 * 
 * Usage: node scripts/process-backup.js <input-file> <output-file>
 * Example: node scripts/process-backup.js backup-2025-01-15.json backup-processed.json
 */

const fs = require('fs');
const path = require('path');

function processBackup(inputPath, outputPath) {
  console.log('Reading backup file...');
  const backupContent = fs.readFileSync(inputPath, 'utf8');
  const backup = JSON.parse(backupContent);

  console.log('Processing gallery images...');
  let base64Removed = 0;
  let totalImages = 0;

  if (backup.data && backup.data.galleryImages) {
    totalImages = backup.data.galleryImages.length;
    backup.data.galleryImages = backup.data.galleryImages.map((img) => {
      const processed = {
        id: img.id,
        srcUrl: img.srcUrl || null,
        thumbnailUrl: img.thumbnailUrl || null,
        mediumUrl: img.mediumUrl || null,
        category: img.category,
        title: img.title,
        description: img.description || null,
        createdAt: img.createdAt,
      };

      // Only keep base64 if URL doesn't exist (for backward compatibility)
      if (!img.srcUrl && img.src) {
        // Check if it's base64 (starts with data:)
        if (img.src.startsWith('data:')) {
          base64Removed++;
          processed.src = null; // Remove base64
        } else {
          processed.src = img.src; // Keep if it's a URL
        }
      } else {
        processed.src = null;
      }

      if (!img.thumbnailUrl && img.thumbnail) {
        if (img.thumbnail.startsWith('data:')) {
          processed.thumbnail = null;
        } else {
          processed.thumbnail = img.thumbnail;
        }
      } else {
        processed.thumbnail = null;
      }

      if (!img.mediumUrl && img.medium) {
        if (img.medium.startsWith('data:')) {
          processed.medium = null;
        } else {
          processed.medium = img.medium;
        }
      } else {
        processed.medium = null;
      }

      return processed;
    });
  }

  // Update backup version and add note
  backup.version = "2.0";
  backup.processedAt = new Date().toISOString();
  backup.note = "Base64 images removed to reduce file size. Images should be in Blob Storage.";

  console.log('Writing processed backup...');
  fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));

  const originalSize = fs.statSync(inputPath).size;
  const newSize = fs.statSync(outputPath).size;
  const sizeReduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

  console.log('\n✅ Backup processed successfully!');
  console.log(`📊 Statistics:`);
  console.log(`   - Total images: ${totalImages}`);
  console.log(`   - Base64 images removed: ${base64Removed}`);
  console.log(`   - Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - New size: ${(newSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   - Size reduction: ${sizeReduction}%`);
  console.log(`\n📁 Processed backup saved to: ${outputPath}`);
  console.log(`\n⚠️  Note: Base64 images have been removed. Make sure your images are in Blob Storage before restoring.`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length < 1) {
  console.error('❌ Error: Missing input file');
  console.log('\nUsage: node scripts/process-backup.js <input-file> [output-file]');
  console.log('\nExample:');
  console.log('  node scripts/process-backup.js backup-2025-01-15.json');
  console.log('  node scripts/process-backup.js backup-2025-01-15.json backup-processed.json');
  process.exit(1);
}

const inputFile = args[0];
const outputFile = args[1] || inputFile.replace('.json', '-processed.json');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

try {
  processBackup(inputFile, outputFile);
} catch (error) {
  console.error('❌ Error processing backup:', error.message);
  process.exit(1);
}

