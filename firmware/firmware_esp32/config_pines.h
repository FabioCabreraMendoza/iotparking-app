#pragma once
#include <Arduino.h>

// ===================== LEDs RGB (4x 74HC595 en cascada, catodo comun) =====
// DS y ST_CP son compartidos por los 4 chips; hay DOS relojes independientes
// que permiten cargar cada cascada (izquierda/derecha) por separado antes de
// hacer un unico pulso de latch comun que actualiza los 10 cajones a la vez.
#define PIN_LED_DATA 4        // DS - compartido (Chip1 y Chip3)
#define PIN_LED_LATCH 16      // ST_CP - compartido (los 4 chips)
#define PIN_LED_CLOCK_IZQ 17  // SH_CP - Chip1+Chip2 (cajones 1-5)
#define PIN_LED_CLOCK_DER 2   // SH_CP - Chip3+Chip4 (cajones 6-10)

// ===================== Sensores infrarrojos (LOW = ocupado) ===============
// Indice 0..9 corresponde a los cajones numero 1..10.
static const uint8_t PINES_IR[10] = {34, 35, 36, 39, 14, 32, 33, 25, 26, 27};

// ===================== RFID RC522 (bus SPI compartido) =====================
#define PIN_RFID_SCK 18
#define PIN_RFID_MISO 19
#define PIN_RFID_MOSI 23
#define PIN_RFID_RST 22        // Compartido por ambos lectores
#define PIN_RFID_SDA_ENTRADA 5 // Exclusivo lector de entrada
#define PIN_RFID_SDA_SALIDA 21 // Exclusivo lector de salida

// ===================== LCD I2C (20x4) =======================================
#define PIN_LCD_SDA 13
#define PIN_LCD_SCL 15
#define LCD_I2C_ADDR 0x27
#define LCD_COLS 20
#define LCD_ROWS 4

// ===================== Servo barrera =========================================
#define PIN_SERVO 12
#define SERVO_ANGULO_CERRADO 0
#define SERVO_ANGULO_ABIERTO 90

// ===================== Red / Backend =========================================
#define WIFI_SSID "CAMBIAR_SSID"
#define WIFI_PASSWORD "CAMBIAR_PASSWORD"
#define BACKEND_HOST "CAMBIAR_HOST_O_IP" // ej. "192.168.1.100" o el host de Render
#define BACKEND_PORT 4000

#define TOTAL_CAJONES 10
