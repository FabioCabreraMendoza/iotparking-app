#pragma once
#include <Arduino.h>
#include "config_pines.h"

enum LedColor { LED_VERDE, LED_ROJO, LED_AZUL };

void ledsSetup();

// Actualiza el color logico de un cajon (1-10) y refresca las salidas fisicas.
void ledsSetCajon(uint8_t numeroCajon, LedColor color);

// Aplica de una sola vez el color de los 10 cajones (strings "verde"/"rojo"/"azul").
void ledsAplicarEstado(const String colores[TOTAL_CAJONES]);
