const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'development.index.html');
const destPath = path.join(__dirname, 'index.html');

try {
  // Check if the destination exists.
  if (fs.existsSync(destPath)) {
    const stats = fs.lstatSync(destPath);
    if (stats.isDirectory()) {
      // If it's a directory, remove it recursively.
      fs.rmSync(destPath, { recursive: true, force: true });
    } else {
      // If it's a file, remove it.
      fs.unlinkSync(destPath);
    }
  }
  fs.copyFileSync(srcPath, destPath);
  console.log('Copied development.index.html to index.html successfully.');
} catch (err) {
  console.error('Error copying file:', err);
  process.exit(1);
}
