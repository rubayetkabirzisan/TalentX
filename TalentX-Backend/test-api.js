import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  method: 'GET',
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Health:', data));
});
req.end();
