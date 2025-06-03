#!/usr/bin/env node

import http from 'http';

const options = {
  hostname: 'localhost',
  port: process.env.PORT || 5000,
  path: '/health',
  method: 'GET',
  timeout: 2000
};

const healthCheck = http.request(options, (res) => {
  console.log(`Healthcheck status: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

healthCheck.on('error', (err) => {
  console.error('Healthcheck failed:', err.message);
  process.exit(1);
});

healthCheck.on('timeout', () => {
  console.error('Healthcheck timeout');
  healthCheck.destroy();
  process.exit(1);
});

healthCheck.end();
