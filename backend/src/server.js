const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const env = require('./config/env');
const { seedAdmin } = require('./db/seedAdmin');
const socketService = require('./services/socketService');
const registerSocketHandlers = require('./sockets');
const { startReservationExpiryService } = require('./services/reservationExpiryService');

const authRoutes = require('./routes/auth');
const cajonesRoutes = require('./routes/cajones');
const usuariosRoutes = require('./routes/usuarios');
const reservasRoutes = require('./routes/reservas');
const historialRoutes = require('./routes/historial');
const reportesRoutes = require('./routes/reportes');
const systemRoutes = require('./routes/system');

const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/cajones', cajonesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/system', systemRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: env.corsOrigin } });
socketService.setIO(io);
registerSocketHandlers(io);

async function start() {
  await seedAdmin();
  startReservationExpiryService();
  server.listen(env.port, () => {
    console.log(`Backend escuchando en puerto ${env.port}`);
  });
}

start().catch((err) => {
  console.error('Error al iniciar el servidor', err);
  process.exit(1);
});
