const parkingService = require('../services/parkingService');

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`Cliente socket conectado: ${socket.id}`);

    parkingService.getAllCajones().then((cajones) => {
      socket.emit('cajones_update', cajones);
      socket.emit('led_state', cajones.map((c) => parkingService.COLOR_BY_ESTADO[c.estado]));
    });

    // ESP32 -> Backend
    socket.on('ir_sensor_update', (lecturas) => {
      parkingService.procesarLecturasIR(lecturas).catch((err) => {
        console.error('Error procesando lecturas IR:', err);
      });
    });

    socket.on('rfid_entry_scan', ({ uid }) => {
      parkingService.handleRfidEntry(uid).catch((err) => {
        console.error('Error procesando RFID de entrada:', err);
      });
    });

    socket.on('rfid_exit_scan', ({ uid }) => {
      parkingService.handleRfidExit(uid).catch((err) => {
        console.error('Error procesando RFID de salida:', err);
      });
    });

    socket.on('disconnect', () => {
      console.log(`Cliente socket desconectado: ${socket.id}`);
    });
  });
}

module.exports = registerSocketHandlers;
