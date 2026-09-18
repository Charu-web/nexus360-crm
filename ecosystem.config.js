module.exports = {
  apps: [
    {
      name: 'empire-crm-backend',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '250M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        USE_LOCAL_DB: 'true',
        DATABASE_URL: 'file:./prisma/dev.db',
        JWT_SECRET: 'empire_crm_super_secret_jwt_key_2026_production',
      },
    },
  ],
};
