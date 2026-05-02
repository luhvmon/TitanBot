import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = process.env.PORT || 3000;
const PUBLIC = join(__dirname, 'dist/public');

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript',
  '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon', '.json': 'application/json',
};

const server = createServer((req, res) => {
  let filePath = join(PUBLIC, req.url === '/' ? 'index.html' : req.url);
  if (!existsSync(filePath)) filePath = join(PUBLIC, 'index.html');
  try {
    const data = readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'text/plain' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(PORT, () => console.log(`Status page running on port ${PORT}`));

const bot = spawn('node', ['artifacts/discord-bot/src/app.js'], {
  stdio: 'inherit',
  env: process.env,
});

bot.on('exit', (code) => {
  console.log(`Bot exited with code ${code}, restarting in 5s...`);
  setTimeout(() => {
    const retry = spawn('node', ['artifacts/discord-bot/src/app.js'], {
      stdio: 'inherit', env: process.env,
    });
    retry.on('exit', () => process.exit(1));
  }, 5000);
});

process.on('SIGTERM', () => { bot.kill(); server.close(); });
