#include "leds.h"

// Color logico actual de cada cajon (indice 0 = cajon numero 1).
static LedColor estadoCajones[TOTAL_CAJONES] = {LED_VERDE, LED_VERDE, LED_VERDE, LED_VERDE, LED_VERDE,
                                                 LED_VERDE, LED_VERDE, LED_VERDE, LED_VERDE, LED_VERDE};

// Construye la palabra de 16 bits (3 bits R,G,B por cajon) para una cascada
// de 2 chips a partir de 5 cajones consecutivos del arreglo de estado.
static uint16_t construirPalabra(const LedColor* cinco) {
  uint16_t palabra = 0;
  for (uint8_t idx = 0; idx < 5; idx++) {
    uint8_t bitR = 0, bitG = 0, bitB = 0;
    switch (cinco[idx]) {
      case LED_ROJO: bitR = 1; break;
      case LED_VERDE: bitG = 1; break;
      case LED_AZUL: bitB = 1; break;
    }
    uint8_t base = idx * 3;
    palabra |= (bitR << base) | (bitG << (base + 1)) | (bitB << (base + 2));
  }
  return palabra;
}

static void enviarCascada(uint16_t palabra, uint8_t clockPin) {
  uint8_t byteLejano = (palabra >> 8) & 0xFF;  // llega al chip 2 (o 4), el mas lejano del DS
  uint8_t byteCercano = palabra & 0xFF;        // se queda en el chip 1 (o 3), conectado al DS
  shiftOut(PIN_LED_DATA, clockPin, MSBFIRST, byteLejano);
  shiftOut(PIN_LED_DATA, clockPin, MSBFIRST, byteCercano);
}

static void refrescarSalidas() {
  uint16_t palabraIzq = construirPalabra(&estadoCajones[0]); // cajones 1-5
  uint16_t palabraDer = construirPalabra(&estadoCajones[5]); // cajones 6-10

  digitalWrite(PIN_LED_LATCH, LOW);
  enviarCascada(palabraIzq, PIN_LED_CLOCK_IZQ);
  enviarCascada(palabraDer, PIN_LED_CLOCK_DER);
  // Pulso de latch compartido: actualiza los 4 chips (10 cajones) a la vez.
  digitalWrite(PIN_LED_LATCH, HIGH);
  digitalWrite(PIN_LED_LATCH, LOW);
}

void ledsSetup() {
  pinMode(PIN_LED_DATA, OUTPUT);
  pinMode(PIN_LED_LATCH, OUTPUT);
  pinMode(PIN_LED_CLOCK_IZQ, OUTPUT);
  pinMode(PIN_LED_CLOCK_DER, OUTPUT);
  digitalWrite(PIN_LED_LATCH, LOW);
  refrescarSalidas();
}

void ledsSetCajon(uint8_t numeroCajon, LedColor color) {
  if (numeroCajon < 1 || numeroCajon > TOTAL_CAJONES) return;
  estadoCajones[numeroCajon - 1] = color;
  refrescarSalidas();
}

static LedColor colorDesdeTexto(const String& texto) {
  if (texto == "rojo") return LED_ROJO;
  if (texto == "azul") return LED_AZUL;
  return LED_VERDE;
}

void ledsAplicarEstado(const String colores[TOTAL_CAJONES]) {
  for (uint8_t i = 0; i < TOTAL_CAJONES; i++) {
    estadoCajones[i] = colorDesdeTexto(colores[i]);
  }
  refrescarSalidas();
}
