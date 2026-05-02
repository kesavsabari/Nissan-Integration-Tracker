const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { promisify } = require('util');

const PORT = process.env.PORT || 5001;
const DIRECTORY = __dirname;
const DATA_DIR = process.env.DATA_DIR || DIRECTORY;
const BACKUP_DIR = path.join(DATA_DIR, 'backups');

const FILES = {
  integrations: path.join(DATA_DIR, 'integrations.json'),
  regions: path.join(DATA_DIR, 'regions.json'),
  statuses: path.join(DATA_DIR, 'statuses.json'),
  history: path.join(DATA_DIR, 'history.json'),
  phases: path.join(DATA_DIR, 'phases.json'),
  globalStatus: path.join(DATA_DIR, 'globalStatus.json')
};

// Bootstrap: Ensure data files exist in DATA_DIR
async function bootstrap() {
  if (!fs.existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
  
  for (const key in FILES) {
    const targetPath = FILES[key];
    const fileName = path.basename(targetPath);
    const sourcePath = path.join(DIRECTORY, fileName);
    
    // If file doesn't exist in DATA_DIR but exists in root, copy it
    if (!fs.existsSync(targetPath) && fs.existsSync(sourcePath) && targetPath !== sourcePath) {
      console.log(`Bootstrapping ${fileName} to ${DATA_DIR}...`);
      await copyFile(sourcePath, targetPath);
    }
  }
}

let lastBackupTime = 0;
const BACKUP_THROTTLE = 300000; // 5 minutes in ms

const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const rmdir = promisify(fs.rmdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

async function createBackup() {
  const now = Date.now();
  if (now - lastBackupTime < BACKUP_THROTTLE) return;

  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      await mkdir(BACKUP_DIR, { recursive: true });
    }

    const ts = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, 15);
    const target = path.join(BACKUP_DIR, ts);
    await mkdir(target, { recursive: true });

    for (const key in FILES) {
      if (fs.existsSync(FILES[key])) {
        await copyFile(FILES[key], path.join(target, path.basename(FILES[key])));
      }
    }

    lastBackupTime = now;
    console.log(`Backup created at ${ts}`);

    // Keep only last 10 backups
    let backups = await readdir(BACKUP_DIR);
    backups = backups.filter(f => fs.statSync(path.join(BACKUP_DIR, f)).isDirectory()).sort();
    
    while (backups.length > 10) {
      const oldest = backups.shift();
      const oldestPath = path.join(BACKUP_DIR, oldest);
      // Recursive delete for Node < 14.14.0 requires a bit more work, 
      // but modern Node has { recursive: true }
      await fs.promises.rm(oldestPath, { recursive: true, force: true });
      console.log(`Removed old backup: ${oldest}`);
    }
  } catch (err) {
    console.error('Backup failed:', err);
  }
}

function sendCompressed(req, res, content, contentType) {
  const acceptEncoding = req.headers['accept-encoding'] || '';
  res.setHeader('Content-Type', contentType);

  if (acceptEncoding.includes('gzip')) {
    zlib.gzip(content, (err, compressed) => {
      if (err) {
        res.statusCode = 500;
        return res.end('Internal Server Error');
      }
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', compressed.length);
      res.end(compressed);
    });
  } else {
    res.setHeader('Content-Length', Buffer.byteLength(content));
    res.end(content);
  }
}

const server = http.createServer(async (req, res) => {
  let url = req.url.split('?')[0];
  url = url === '/' ? '/index.html' : url;

  if (url === '/api/data' && req.method === 'GET') {
    const data = {};
    for (const key in FILES) {
      if (fs.existsSync(FILES[key])) {
        data[key] = JSON.parse(await readFile(FILES[key], 'utf8'));
      } else {
        data[key] = key === 'statuses' ? {} : [];
      }
    }
    sendCompressed(req, res, JSON.stringify(data), 'application/json');
    return;
  }

  if (url === '/api/data' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        await createBackup();

        for (const key in FILES) {
          if (data[key] !== undefined) {
            await writeFile(FILES[key], JSON.stringify(data[key], null, 2), 'utf8');
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        res.writeHead(400);
        res.end(err.message);
      }
    });
    return;
  }

  // Static files
  const filePath = path.join(DIRECTORY, url);
  const ext = path.extname(filePath);
  const contentTypes = {
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
  };

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const content = await readFile(filePath);
    sendCompressed(req, res, content, contentTypes[ext] || 'text/plain');
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

bootstrap().then(() => {
  server.listen(PORT, () => {
    console.log(`Nissan Integration Tracker running at http://localhost:${PORT}`);
    console.log('100% Zero-Dependency Node.js Mode Active');
  });
});
