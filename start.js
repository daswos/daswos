import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Display the banner
console.log('\n');
console.log('='.repeat(60));
console.log('🚀 Starting Daswos Application...');
console.log('='.repeat(60));
console.log('\n');
console.log('🔗 Application will be available at: http://localhost:3000');
console.log('\n');
console.log('='.repeat(60));
console.log('\n');

// Run npm dev command
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const child = spawn(npm, ['run', 'dev'], { 
  stdio: 'inherit',
  cwd: __dirname
});

child.on('error', (error) => {
  console.error(`Error starting the application: ${error.message}`);
  process.exit(1);
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`Application exited with code ${code}`);
    process.exit(code);
  }
});
