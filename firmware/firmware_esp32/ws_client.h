#pragma once
#include <Arduino.h>
#include "config_pines.h"

void wsSetup();
void wsLoop();

void wsEmitIrSensorUpdate(const bool lecturas[TOTAL_CAJONES]);
void wsEmitRfidEntryScan(const String& uid);
void wsEmitRfidExitScan(const String& uid);
