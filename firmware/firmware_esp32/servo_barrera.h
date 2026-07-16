#pragma once
#include <Arduino.h>

void servoSetup();
void servoAbrirBarrera();

// Avanza el angulo actual hacia el objetivo en pasos cortos (no bloqueante)
// y cierra automaticamente la barrera tras un tiempo de cortesia. Llamar en loop().
void servoLoop();
