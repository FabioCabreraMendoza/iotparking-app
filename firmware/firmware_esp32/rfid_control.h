#pragma once
#include <Arduino.h>

void rfidSetup();

// Debe llamarse en cada loop(). Invoca los callbacks con el UID (hex string)
// cuando detecta una tarjeta nueva en el lector de entrada o de salida,
// respetando un cooldown por lector para no disparar multiples veces la
// misma lectura mientras la tarjeta sigue sobre el sensor.
void rfidLoop(void (*onEntrada)(const String& uid), void (*onSalida)(const String& uid));
