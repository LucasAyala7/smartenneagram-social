// PM2 ecosystem — roda o Next.js em produção na VPS
// Uso: pm2 start ecosystem.config.js && pm2 save && pm2 startup
module.exports = {
  apps: [
    {
      name: "smartenneagram-social",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3030",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3030"
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      merge_logs: true,
      time: true
    }
  ]
};
