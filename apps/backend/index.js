const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Backend running');
});

const port = process.env.PORT || 4000;
server.listen(port, () => console.log(`Backend listening on ${port}`));
