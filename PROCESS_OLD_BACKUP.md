# How to Process Your Old Backup File

Your old backup file contains base64 images which makes it too large (>4.5MB) to restore on Vercel. This guide will help you process it to remove base64 images and make it small enough to restore.

## Quick Solution

### Step 1: Run the Processing Script

1. **Open PowerShell** in your project directory:
   ```powershell
   cd "D:\Club Website\Science-Club"
   ```

2. **Run the script** with your backup file:
   ```powershell
   node scripts/process-backup.js "path/to/your/backup-file.json"
   ```
   
   Example:
   ```powershell
   node scripts/process-backup.js "C:\Users\YourName\Downloads\backup-2025-01-15.json"
   ```

3. **The script will:**
   - Read your backup file
   - Remove all base64 image data
   - Keep only URLs and metadata
   - Create a new processed backup file (with `-processed.json` suffix)

### Step 2: Use the Processed Backup

1. **Find the processed file** (same location as input, with `-processed.json` suffix)
2. **Go to** `/admin/backup` in your admin panel
3. **Upload the processed backup file**
4. **Click "Restore Backup"**

The processed backup will be much smaller and should restore successfully!

---

## What the Script Does

- ✅ Removes base64 image data (the large part)
- ✅ Keeps image URLs (if they exist)
- ✅ Keeps all metadata (titles, categories, etc.)
- ✅ Keeps all other data (events, team, updates, etc.)
- ✅ Reduces file size by 90-95% typically

## Example Output

```
Reading backup file...
Processing gallery images...
Writing processed backup...

✅ Backup processed successfully!
📊 Statistics:
   - Total images: 12
   - Base64 images removed: 12
   - Original size: 68.50 MB
   - New size: 0.15 MB
   - Size reduction: 99.8%

📁 Processed backup saved to: backup-2025-01-15-processed.json

⚠️  Note: Base64 images have been removed. Make sure your images are in Blob Storage before restoring.
```

---

## Alternative: Manual Processing (Advanced)

If you prefer to edit the backup file manually:

1. **Open the backup JSON file** in a text editor
2. **Find the `galleryImages` array**
3. **For each image object:**
   - Remove the `src` field if it starts with `data:image`
   - Remove the `thumbnail` field if it starts with `data:image`
   - Remove the `medium` field if it starts with `data:image`
   - Keep `srcUrl`, `thumbnailUrl`, `mediumUrl` if they exist
4. **Save the file**

⚠️ **Warning**: This is tedious and error-prone. Use the script instead!

---

## Troubleshooting

### Script not found
```powershell
# Make sure you're in the project directory
cd "D:\Club Website\Science-Club"
# Check if script exists
dir scripts\process-backup.js
```

### Node.js not found
```powershell
# Check if Node.js is installed
node --version
# If not installed, install Node.js from nodejs.org
```

### File path with spaces
```powershell
# Use quotes around file path
node scripts/process-backup.js "C:\Users\Your Name\Downloads\backup file.json"
```

### Still too large after processing
- Check if there are other large base64 fields (like event images)
- The script only processes gallery images
- Contact support if needed

---

## Important Notes

1. **Images in Blob Storage**: After restoring, make sure your images are uploaded to Blob Storage. The processed backup only contains URLs, not the actual image data.

2. **Backup Original**: Keep your original backup file safe! The processed backup doesn't contain image data.

3. **Future Backups**: New backups exported from the admin panel will automatically exclude base64 images, so this is a one-time process.

---

## Need Help?

If you encounter any issues:
1. Check the error message in the console
2. Verify the backup file is valid JSON
3. Make sure Node.js is installed
4. Check file paths are correct

The processed backup should be small enough (<1MB typically) to restore successfully!

