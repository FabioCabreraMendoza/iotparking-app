require('dotenv').config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value;
}

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET', 'dev-secret-change-me'),
  adminUsername: process.env.ADMIN_USERNAME || 'admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  reservationDurationMinutes: parseFloat(process.env.RESERVATION_DURATION_MINUTES || '1'),
  corsOrigin: process.env.CORS_ORIGIN || '*',
  totalCajones: parseInt(process.env.TOTAL_CAJONES || '10', 10),
  maxReservasActivas: parseInt(process.env.MAX_RESERVAS_ACTIVAS || '5', 10),
};
