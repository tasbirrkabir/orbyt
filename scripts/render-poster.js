const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 5566;
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/case-study-poster.html';
  const filePath = path.join(PUBLIC_DIR, reqPath);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  try {
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const outputPath = path.join(PUBLIC_DIR, 'orbyt-meta-growth-poster.png');
    
    // Command to take high-res screenshot (1080x1350 for Instagram / LinkedIn / Facebook)
    const cmd = `"${edgePath}" --headless=new --disable-gpu --window-size=1180,1480 --hide-scrollbars --screenshot="${outputPath}" "http://localhost:${PORT}/case-study-poster.html"`;
    console.log('Running render command...');
    execSync(cmd, { stdio: 'inherit' });
    console.log('Screenshot rendered successfully to:', outputPath);
  } catch (err) {
    console.error('Render error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
});
