#include "rfid_control.h"
#include "config_pines.h"
#include <SPI.h>
#include <MFRC522.h>

static MFRC522 lectorEntrada(PIN_RFID_SDA_ENTRADA, PIN_RFID_RST);
static MFRC522 lectorSalida(PIN_RFID_SDA_SALIDA, PIN_RFID_RST);

static const unsigned long COOLDOWN_MS = 2500; // evita relecturas mientras la tarjeta sigue en el lector
static unsigned long ultimaLecturaEntrada = 0;
static unsigned long ultimaLecturaSalida = 0;

static String uidToString(MFRC522::Uid uid) {
  String resultado = "";
  for (byte i = 0; i < uid.size; i++) {
    if (uid.uidByte[i] < 0x10) resultado += "0";
    resultado += String(uid.uidByte[i], HEX);
  }
  resultado.toUpperCase();
  return resultado;
}

void rfidSetup() {
  SPI.begin(PIN_RFID_SCK, PIN_RFID_MISO, PIN_RFID_MOSI, -1);
  lectorEntrada.PCD_Init();
  lectorSalida.PCD_Init();
}

static bool leerTarjeta(MFRC522& lector, String& uidOut) {
  if (!lector.PICC_IsNewCardPresent()) return false;
  if (!lector.PICC_ReadCardSerial()) return false;
  uidOut = uidToString(lector.uid);
  lector.PICC_HaltA();
  lector.PCD_StopCrypto1();
  return true;
}

void rfidLoop(void (*onEntrada)(const String&), void (*onSalida)(const String&)) {
  unsigned long ahora = millis();
  String uid;

  if (ahora - ultimaLecturaEntrada > COOLDOWN_MS && leerTarjeta(lectorEntrada, uid)) {
    ultimaLecturaEntrada = ahora;
    onEntrada(uid);
  }

  if (ahora - ultimaLecturaSalida > COOLDOWN_MS && leerTarjeta(lectorSalida, uid)) {
    ultimaLecturaSalida = ahora;
    onSalida(uid);
  }
}
