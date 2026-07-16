#include "servo_barrera.h"
#include "config_pines.h"
#include <ESP32Servo.h>

static Servo servo;
static int anguloActual = SERVO_ANGULO_CERRADO;
static int anguloObjetivo = SERVO_ANGULO_CERRADO;
static unsigned long ultimoPaso = 0;
static unsigned long abiertaDesde = 0;
static bool estaAbierta = false;

static const unsigned long PASO_INTERVALO_MS = 15; // velocidad de la transicion suave
static const unsigned long TIEMPO_ABIERTA_MS = 4000; // cortesia antes de auto-cerrar

void servoSetup() {
  servo.attach(PIN_SERVO);
  servo.write(SERVO_ANGULO_CERRADO);
}

void servoAbrirBarrera() {
  anguloObjetivo = SERVO_ANGULO_ABIERTO;
  estaAbierta = true;
  abiertaDesde = millis();
}

void servoLoop() {
  unsigned long ahora = millis();

  if (estaAbierta && anguloActual == SERVO_ANGULO_ABIERTO && ahora - abiertaDesde > TIEMPO_ABIERTA_MS) {
    anguloObjetivo = SERVO_ANGULO_CERRADO;
    estaAbierta = false;
  }

  if (anguloActual == anguloObjetivo) return;
  if (ahora - ultimoPaso < PASO_INTERVALO_MS) return;
  ultimoPaso = ahora;

  anguloActual += (anguloObjetivo > anguloActual) ? 1 : -1;
  servo.write(anguloActual);
}
