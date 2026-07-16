#include "lcd_display.h"
#include "config_pines.h"
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

static LiquidCrystal_I2C lcd(LCD_I2C_ADDR, LCD_COLS, LCD_ROWS);
static unsigned long ultimoMensaje = 0;
static const unsigned long DURACION_MENSAJE_MS = 4000;
static bool mostrandoIdle = true;

static void mostrarIdle() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Estacionamiento");
  lcd.setCursor(0, 1);
  lcd.print("Sistema Activo");
  mostrandoIdle = true;
}

void lcdSetup() {
  Wire.begin(PIN_LCD_SDA, PIN_LCD_SCL);
  lcd.init();
  lcd.backlight();
  mostrarIdle();
}

void lcdMostrarMensaje(const String& linea1, const String& linea2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(linea1);
  if (linea2.length() > 0) {
    lcd.setCursor(0, 1);
    lcd.print(linea2);
  }
  ultimoMensaje = millis();
  mostrandoIdle = false;
}

void lcdLoop() {
  if (!mostrandoIdle && millis() - ultimoMensaje > DURACION_MENSAJE_MS) {
    mostrarIdle();
  }
}
