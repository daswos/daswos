const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build the client
console.log('Building client...');
execSync('npx vite build', { stdio: 'inherit' });

// Create dist/server directory if it doesn't exist
const serverDistDir = path.join(__dirname, 'dist', 'server');
if (!fs.existsSync(serverDistDir)) {
  fs.mkdirSync(serverDistDir, { recursive: true });
}

// Copy server files to dist/server
console.log('Copying server files...');
const copyDir = (src, dest) => {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

copyDir(path.join(__dirname, 'server'), serverDistDir);

// Copy shared directory if it exists
const sharedSrcDir = path.join(__dirname, 'shared');
const sharedDestDir = path.join(__dirname, 'dist', 'shared');

if (fs.existsSync(sharedSrcDir)) {
  console.log('Copying shared files...');
  copyDir(sharedSrcDir, sharedDestDir);
}

console.log('Build completed successfully!');
