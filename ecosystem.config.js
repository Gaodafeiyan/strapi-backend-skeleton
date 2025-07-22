module.exports = {
  apps: [
    {
      name: 'strapi-api',
      script: 'npm',
      args: 'run start',
      cwd: './strapi-backend-skeleton',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 1337
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 1337
      }
    }
  ]
}; 