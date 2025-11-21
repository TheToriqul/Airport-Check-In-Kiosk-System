#!/usr/bin/env node

/**
 * Cross-platform script to start both backend and frontend
 * Works on Mac, Linux, and Windows
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isWindows = os.platform() === 'win32';
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  // Check if backend directory exists
  if (!fs.existsSync(backendDir)) {
    log('❌ Backend directory not found!', 'red');
    process.exit(1);
  }

  // Check if frontend directory exists
  if (!fs.existsSync(frontendDir)) {
    log('❌ Frontend directory not found!', 'red');
    process.exit(1);
  }

  // Check if frontend node_modules exists
  const frontendNodeModules = path.join(frontendDir, 'node_modules');
  if (!fs.existsSync(frontendNodeModules)) {
    log('⚠️  Frontend dependencies not installed. Run: npm run install:all', 'yellow');
  }
}

function startBackend() {
  log('\n🚀 Starting Backend (Spring Boot)...', 'cyan');

  const backendScript = isWindows
    ? path.join(backendDir, 'run.bat')
    : path.join(backendDir, 'run.sh');

  // If run script doesn't exist, use Maven directly
  if (!fs.existsSync(backendScript)) {
    log('   Using Maven directly...', 'yellow');
    const mvnCmd = isWindows ? 'mvn.cmd' : 'mvn';
    const backendProcess = spawn(mvnCmd, ['spring-boot:run'], {
      cwd: backendDir,
      shell: false, // Use shell: false to avoid deprecation warning
      stdio: 'inherit',
      env: process.env,
    });

    backendProcess.on('error', (err) => {
      log(`❌ Backend error: ${err.message}`, 'red');
    });

    return backendProcess;
  }

  // Use the run script - properly handle paths with spaces
  if (isWindows) {
    // For Windows, use cmd with the script path
    const backendProcess = spawn('cmd', ['/c', 'run.bat'], {
      cwd: backendDir, // Change directory first, then run relative script
      shell: false,
      stdio: 'inherit',
      env: process.env,
    });

    backendProcess.on('error', (err) => {
      log(`❌ Backend error: ${err.message}`, 'red');
    });

    return backendProcess;
  } else {
    // For Unix-like systems, change to backend directory and run the script
    // This avoids path issues with spaces by using relative path
    const backendProcess = spawn('bash', ['run.sh'], {
      cwd: backendDir, // Change directory first, then run relative script
      shell: false,
      stdio: 'inherit',
      env: process.env,
    });

    backendProcess.on('error', (err) => {
      log(`❌ Backend error: ${err.message}`, 'red');
    });

    return backendProcess;
  }
}

function startFrontend() {
  log('\n🚀 Starting Frontend (React + Vite)...', 'cyan');

  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: frontendDir,
    shell: false, // Use shell: false to avoid deprecation warning
    stdio: 'inherit',
    env: process.env,
  });

  frontendProcess.on('error', (err) => {
    log(`❌ Frontend error: ${err.message}`, 'red');
  });

  return frontendProcess;
}

function main() {
  log('\n' + '='.repeat(60), 'bright');
  log('  Airport Check-In Kiosk System', 'bright');
  log('  Starting Backend & Frontend...', 'bright');
  log('='.repeat(60) + '\n', 'bright');

  checkPrerequisites();

  const backendProcess = startBackend();
  const frontendProcess = startFrontend();

  // Handle process termination
  process.on('SIGINT', () => {
    log('\n\n🛑 Shutting down...', 'yellow');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('\n\n🛑 Shutting down...', 'yellow');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });

  // Handle process errors
  backendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n❌ Backend exited with code ${code}`, 'red');
    }
  });

  frontendProcess.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      log(`\n❌ Frontend exited with code ${code}`, 'red');
    }
  });

  log('\n✅ Both services are starting...', 'green');
  log('   Backend:  http://localhost:8080', 'cyan');
  log('   Frontend: http://localhost:5173', 'cyan');
  log('\n   Press Ctrl+C to stop both services\n', 'yellow');
}

main();
