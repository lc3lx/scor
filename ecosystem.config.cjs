/**
 * PM2 — Scar Alpha Frontend (static dist)
 *
 * Usage:
 *   chmod +x start-frontend-pm2.sh
 *   ./start-frontend-pm2.sh
 */
const path = require('path');

const port = process.env.FRONT_PORT || '4173';

module.exports = {
  apps: [
    {
      name: 'scaralpha-front',
      cwd: __dirname,
      script: 'npx',
      args: `serve -s dist -l tcp://0.0.0.0:${port}`,
      interpreter: 'none',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      // npx/serve can leave children; don't hang forever on restart/delete
      kill_timeout: 8000,
      kill_retry_time: 100,
      wait_ready: false,
      error_file: path.join(__dirname, 'logs', 'pm2-error.log'),
      out_file: path.join(__dirname, 'logs', 'pm2-out.log'),
      merge_logs: true,
      time: true,
      env: {
        NODE_ENV: 'production',
        FRONT_PORT: port,
        PATH: process.env.PATH || '',
      },
    },
  ],
};
