#!/usr/bin/env node
/**
 * Start Express API + Vite together for local development.
 * Prevents the common Vite proxy ECONNREFUSED when API is not running.
 */
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const children = [];

function run(name, command, args, cwd) {
  const child = spawn(command, args, {
    cwd,
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  child.on('exit', (code) => {
    console.log(`[${name}] exited with code ${code}`);
    shutdown(code || 0);
  });
  children.push(child);
}

function shutdown(code = 0) {
  children.forEach((child) => {
    if (!child.killed) child.kill('SIGTERM');
  });
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

console.log('Starting Astoria API (:5000) and Vite (:3000)...');
run('api', 'npm', ['start'], path.join(root, 'server'));
setTimeout(() => {
  run('vite', 'npm', ['run', 'dev'], root);
}, 1200);
