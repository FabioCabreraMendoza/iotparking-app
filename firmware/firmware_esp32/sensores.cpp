#include "sensores.h"

static const unsigned long POLL_INTERVAL_MS = 150;
static const uint8_t DEBOUNCE_LECTURAS = 3; // ~450ms de estabilidad antes de reportar

static unsigned long ultimoPoll = 0;
static bool ultimoEnviado[TOTAL_CAJONES];
static bool candidato[TOTAL_CAJONES];
static uint8_t contadorEstable[TOTAL_CAJONES];

void sensoresSetup() {
  for (uint8_t i = 0; i < TOTAL_CAJONES; i++) {
    pinMode(PINES_IR[i], INPUT);
    bool ocupado = (digitalRead(PINES_IR[i]) == LOW); // logica inversa: LOW = ocupado
    ultimoEnviado[i] = ocupado;
    candidato[i] = ocupado;
    contadorEstable[i] = DEBOUNCE_LECTURAS;
  }
}

void sensoresLoop(void (*onCambio)(const bool[TOTAL_CAJONES])) {
  unsigned long ahora = millis();
  if (ahora - ultimoPoll < POLL_INTERVAL_MS) return;
  ultimoPoll = ahora;

  bool huboCambio = false;
  bool lecturas[TOTAL_CAJONES];

  for (uint8_t i = 0; i < TOTAL_CAJONES; i++) {
    bool ocupadoAhora = (digitalRead(PINES_IR[i]) == LOW);

    if (ocupadoAhora == candidato[i]) {
      if (contadorEstable[i] < DEBOUNCE_LECTURAS) contadorEstable[i]++;
    } else {
      candidato[i] = ocupadoAhora;
      contadorEstable[i] = 1;
    }

    if (contadorEstable[i] >= DEBOUNCE_LECTURAS && candidato[i] != ultimoEnviado[i]) {
      ultimoEnviado[i] = candidato[i];
      huboCambio = true;
    }
    lecturas[i] = ultimoEnviado[i];
  }

  if (huboCambio) {
    onCambio(lecturas);
  }
}
