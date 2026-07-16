#pragma once
#include <Arduino.h>

void lcdSetup();
void lcdMostrarMensaje(const String& linea1, const String& linea2 = "");

// Revierte a la pantalla de reposo transcurrido un tiempo. Llamar en cada loop().
void lcdLoop();
