#include "ws_client.h"
#include <WiFi.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>
#include "leds.h"
#include "servo_barrera.h"
#include "lcd_display.h"

static SocketIOclient socketIO;

static void manejarEventoLedState(JsonArray datos) {
  String colores[TOTAL_CAJONES];
  for (uint8_t i = 0; i < TOTAL_CAJONES && i < datos.size(); i++) {
    colores[i] = datos[i].as<String>();
  }
  ledsAplicarEstado(colores);
}

static void manejarEventoLcdMessage(JsonObject datos) {
  String linea1 = datos["line1"] | "";
  String linea2 = datos["line2"] | "";
  lcdMostrarMensaje(linea1, linea2);
}

static void socketIOEvent(socketIOmessageType_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case sIOtype_CONNECT:
      // Union explicita al namespace por defecto (requerido desde Socket.IO v3+).
      socketIO.send(sIOtype_CONNECT, "/");
      Serial.println("[WS] Conectado al backend");
      break;

    case sIOtype_DISCONNECT:
      Serial.println("[WS] Desconectado del backend");
      break;

    case sIOtype_EVENT: {
      char* sptr = NULL;
      strtol((char*)payload, &sptr, 10);
      if (sptr != (char*)payload) payload = (uint8_t*)sptr; // salta el id de ack, si vino uno

      DynamicJsonDocument doc(1024);
      DeserializationError error = deserializeJson(doc, payload, length);
      if (error) {
        Serial.printf("[WS] Error parseando evento: %s\n", error.c_str());
        return;
      }

      String nombreEvento = doc[0];
      if (nombreEvento == "led_state") {
        manejarEventoLedState(doc[1].as<JsonArray>());
      } else if (nombreEvento == "open_barrier") {
        servoAbrirBarrera();
      } else if (nombreEvento == "lcd_message") {
        manejarEventoLcdMessage(doc[1].as<JsonObject>());
      }
      break;
    }

    default:
      break;
  }
}

void wsSetup() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("IP asignada: ");
  Serial.println(WiFi.localIP());

  socketIO.begin(BACKEND_HOST, BACKEND_PORT, "/socket.io/?EIO=4");
  socketIO.onEvent(socketIOEvent);
}

void wsLoop() {
  socketIO.loop();
}

void wsEmitIrSensorUpdate(const bool lecturas[TOTAL_CAJONES]) {
  DynamicJsonDocument doc(512);
  JsonArray raiz = doc.to<JsonArray>();
  raiz.add("ir_sensor_update");
  JsonArray datos = raiz.createNestedArray();
  for (uint8_t i = 0; i < TOTAL_CAJONES; i++) datos.add(lecturas[i]);

  String output;
  serializeJson(doc, output);
  socketIO.sendEVENT(output);
}

void wsEmitRfidEntryScan(const String& uid) {
  DynamicJsonDocument doc(256);
  JsonArray raiz = doc.to<JsonArray>();
  raiz.add("rfid_entry_scan");
  JsonObject datos = raiz.createNestedObject();
  datos["uid"] = uid;

  String output;
  serializeJson(doc, output);
  socketIO.sendEVENT(output);
}

void wsEmitRfidExitScan(const String& uid) {
  DynamicJsonDocument doc(256);
  JsonArray raiz = doc.to<JsonArray>();
  raiz.add("rfid_exit_scan");
  JsonObject datos = raiz.createNestedObject();
  datos["uid"] = uid;

  String output;
  serializeJson(doc, output);
  socketIO.sendEVENT(output);
}
