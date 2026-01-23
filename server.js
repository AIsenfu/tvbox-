const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const HOST = '0.0.0.0'; // 监听所有网络接口

// 读取文件内容
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

// 判断是否是浏览器请求
function isBrowserRequest(userAgent) {
  const browserKeywords = [
    'Mozilla', 'Chrome', 'Safari', 'Firefox', 'Edge',
    'Opera', 'MSIE', 'Trident', 'AppleWebKit'
  ];
  
  for (const keyword of browserKeywords) {
    if (userAgent && userAgent.toLowerCase().includes(keyword.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// 判断是否是tvbox请求
function isTvboxRequest(userAgent) {
  const tvboxKeywords = [
    'TVBox', 'tvbox', '猫影视', 'Ok影视', 'box'
  ];
  
  for (const keyword of tvboxKeywords) {
    if (userAgent && userAgent.toLowerCase().includes(keyword.toLowerCase())) {
      return true;
    }
  }
  return false;
}

// 创建服务器
const server = http.createServer((req, res) => {
  const method = req.method;
  const url = req.url;
  const userAgent = req.headers['user-agent'] || '';
  
  console.log(`[${new Date().toISOString()}] ${method} ${url} - UA: ${userAgent}`);
  
  // 设置CORS头，允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // 处理OPTIONS请求
  if (method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // 处理根路径请求
  if (url === '/' || url === '/index.html') {
    // 判断请求类型
    const isBrowser = isBrowserRequest(userAgent);
    const isTvbox = isTvboxRequest(userAgent);
    
    console.log(`Request type: browser=${isBrowser}, tvbox=${isTvbox}, method=${method}`);
    
    // 逻辑判断：
    // 1. tvbox请求 -> 返回resource.json
    // 2. 非浏览器请求 -> 返回resource.json
    // 3. 浏览器请求 -> 返回index.html
    if (isTvbox || !isBrowser) {
      // tvbox或非浏览器请求返回resource.json
      const resourceJson = readFile(path.join(__dirname, 'resource.json'));
      if (resourceJson) {
        res.writeHead(200, {
          'Content-Type': 'application/json; charset=utf-8',
          'Content-Length': Buffer.byteLength(resourceJson)
        });
        res.end(resourceJson);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to load resource.json');
      }
    } else {
      // 浏览器请求返回index.html
      const indexHtml = readFile(path.join(__dirname, 'index.html'));
      if (indexHtml) {
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': Buffer.byteLength(indexHtml)
        });
        res.end(indexHtml);
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to load index.html');
      }
    }
  } else {
    // 处理其他静态文件请求
    const filePath = path.join(__dirname, url);
    
    // 检查文件是否存在
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      // 根据文件扩展名设置Content-Type
      const extname = path.extname(filePath);
      let contentType = 'application/octet-stream';
      
      switch (extname) {
        case '.html':
          contentType = 'text/html; charset=utf-8';
          break;
        case '.css':
          contentType = 'text/css; charset=utf-8';
          break;
        case '.js':
          contentType = 'application/javascript; charset=utf-8';
          break;
        case '.json':
          contentType = 'application/json; charset=utf-8';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.svg':
          contentType = 'image/svg+xml; charset=utf-8';
          break;
      }
      
      try {
        // 读取并返回文件
        const fileContent = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': contentType,
          'Content-Length': fileContent.length
        });
        res.end(fileContent);
      } catch (error) {
        console.error(`Error serving file ${filePath}:`, error);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Failed to load file');
      }
    } else {
      // 文件不存在
      console.log(`File not found: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('File not found');
    }
  }
});

// 启动服务器
server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}/`);
  console.log('Request handling logic:');
  console.log('- TVBox requests: returns resource.json');
  console.log('- Non-browser requests: returns resource.json');
  console.log('- Browser requests: returns index.html');
  console.log('- Other paths: serves static files');
  console.log('Press Ctrl+C to stop server');
});

// 处理服务器错误
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  } else {
    console.error('Server error:', error);
  }
  process.exit(1);
});
