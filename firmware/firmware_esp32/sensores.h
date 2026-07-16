#pragma once
#include <Arduino.h>
#include "config_pines.h"

void sensoresSetup();

// Debe llamarse en cada loop(). Cuando detecta un cambio estable de estado
// en algun cajon, invoca el callback con el arreglo completo de 10 lecturas
// (true = ocupado / LOW), listo para enviarse al backend.
void sensoresLoop(void (*onCambio)(const bool lecturas[TOTAL_CAJONES]));
