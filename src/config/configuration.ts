export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
  },
  cors: {
    // Comma-separated allowed origins for production (e.g. the deployed
    // frontend's URL). Left unset, CORS allows any origin — fine for local
    // development, not for a real deployment.
    origin: process.env.CORS_ORIGIN,
  },
  analyticsService: {
    baseUrl: process.env.ANALYTICS_SERVICE_URL ?? 'http://localhost:8000',
    apiKey: process.env.ANALYTICS_SERVICE_API_KEY,
  },
});
