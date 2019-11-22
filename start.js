const fs = require('fs');
const http = require('http');
const path = require('path');

const SERVER_PORT = 3000;
const SERVER_PATH = path.join(__dirname, process.argv[2]);

const EXTENSION_TO_CONTENT_TYPE = {
  css: 'text/css',
  html: 'text/html',
  jpg: 'image/jpg',
  js: 'text/javascript',
  json: 'application/json',
  png: 'image/png',
};

const extensionToContentType = (extension) => {
  return EXTENSION_TO_CONTENT_TYPE[extension.substr(1)] || 'text/plain';
};

const requestHandler = ({ url }, response) => {
  console.log(url);

  const requestPath = url.substr(-1) === '/' ? `${url}index.html` : url;
  const filePath = path.join(SERVER_PATH, requestPath);
  const isFile = fs.existsSync(filePath) && fs.statSync(filePath).isFile();

  if (isFile) {
    const content = fs.readFileSync(filePath);
    const contentType = extensionToContentType(path.extname(filePath));
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content);
  } else {
    response.writeHead(404);
    response.end('Not found');
  }
};

http.createServer(requestHandler).listen(SERVER_PORT, (error) => {
  if (error) return console.err(error);
  console.log(`Server listening on ${SERVER_PORT}`);
  console.log(`Server path is ${SERVER_PATH}`);
});
