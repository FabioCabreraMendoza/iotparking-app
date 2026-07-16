let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  if (!ioInstance) throw new Error('Socket.io no ha sido inicializado');
  return ioInstance;
}

function broadcastCajones(cajones) {
  getIO().emit('cajones_update', cajones);
}

function broadcastLedState(colores) {
  getIO().emit('led_state', colores);
}

function broadcastNewCard(uid) {
  getIO().emit('new_card_detected', { uid });
}

function broadcastHistorial(entry) {
  getIO().emit('historial_update', entry);
}

function sendOpenBarrier() {
  getIO().emit('open_barrier');
}

function sendLcdMessage(line1, line2 = '') {
  getIO().emit('lcd_message', { line1, line2 });
}

module.exports = {
  setIO,
  getIO,
  broadcastCajones,
  broadcastLedState,
  broadcastNewCard,
  broadcastHistorial,
  sendOpenBarrier,
  sendLcdMessage,
};
