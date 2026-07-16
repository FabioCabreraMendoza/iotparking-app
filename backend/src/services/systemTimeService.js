// Reloj simulado: el admin puede fijar una fecha/hora para generar historicos
// de prueba verosimiles. Se guarda como un offset en memoria respecto al reloj
// real; toda la logica de negocio (reservas, historial) usa getSystemTime()
// en vez de `new Date()` directamente.
let offsetMs = 0;

function getSystemTime() {
  return new Date(Date.now() + offsetMs);
}

function setSystemTime(targetDate) {
  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    throw new Error('Fecha invalida');
  }
  offsetMs = target.getTime() - Date.now();
  return getSystemTime();
}

function resetSystemTime() {
  offsetMs = 0;
}

module.exports = { getSystemTime, setSystemTime, resetSystemTime };
