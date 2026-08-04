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
  analyticsService: {
    baseUrl: process.env.ANALYTICS_SERVICE_URL ?? 'http://localhost:8000',
    apiKey: process.env.ANALYTICS_SERVICE_API_KEY,
  },
});
