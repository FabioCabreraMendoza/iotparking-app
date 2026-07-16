// Firmware ESP32 - Sistema de Estacionamiento Inteligente (10 cajones)
//
// Arquitectura no bloqueante: setup() solo bloquea brevemente para conectar
// WiFi (una vez, al arrancar); loop() nunca usa delay(), cada subsistema se
// actualiza por polling basado en millis().

#include <Arduino.h>
#include "config_pines.h"
#include "leds.h"
#include "sensores.h"
#include "rfid_control.h"
#include "lcd_display.h"
#include "servo_barrera.h"
#include "ws_client.h"

static void alCambiarSensores(const bool lecturas[TOTAL_CAJONES]) {
  wsEmitIrSensorUpdate(lecturas);
}

static void alLeerEntrada(const String& uid) {
  wsEmitRfidEntryScan(uid);
}

static void alLeerSalida(const String& uid) {
  wsEmitRfidExitScan(uid);
}

void setup() {
  Serial.begin(115200);

  ledsSetup();
  sensoresSetup();
  rfidSetup();
  lcdSetup();
  servoSetup();
  wsSetup();
}

void loop() {
  wsLoop();
  sensoresLoop(alCambiarSensores);
  rfidLoop(alLeerEntrada, alLeerSalida);
  servoLoop();
  lcdLoop();
}
