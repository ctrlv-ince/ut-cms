#include <WiFi.h>
#include <PubSubClient.h>   // Library: "PubSubClient" by Nick O'Leary
#include <Wire.h>
#include <BH1750.h>

BH1750 lightMeter;

// ==================================
// CONFIGURATION
// ==================================
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* MQTT_BROKER   = "YOUR_RASPBERRY_PI_IP";
const int   MQTT_PORT     = 1883;
const char* MQTT_TOPIC    = "esp32/sensor_data";
const char* MQTT_STATUS_TOPIC = "esp32/status";   // online/offline (Last Will)
const char* MQTT_CLIENT_ID    = "esp32-sensor-node";

// If your Mosquitto broker requires a login, fill these in.
// Leave MQTT_USER as "" for anonymous access.
const char* MQTT_USER     = "";
const char* MQTT_PASS     = "";

const unsigned long PUBLISH_INTERVAL_MS = 5000;   // publish every 5 seconds
const unsigned long WIFI_RETRY_MS       = 10000;  // retry Wi-Fi every 10 s
const unsigned long MQTT_RETRY_MS       = 5000;   // retry MQTT every 5 s

// ==================================
// PINS
// ==================================
const int trigPin = 25;
const int echoPin = 26;

const int soilPin = 34;   // ADC1 - safe to use with Wi-Fi
const int I2C_SDA_PIN = 21;
const int I2C_SCL_PIN = 22;

// Soil moisture calibration values
int soilDry = 3000;
int soilWet = 1200;

// ==================================
// GLOBALS
// ==================================
WiFiClient   wifiClient;
PubSubClient mqttClient(wifiClient);

unsigned long lastPublish   = 0;
unsigned long lastWifiTry   = 0;
unsigned long lastMqttTry   = 0;

// ==================================
// WI-FI
// ==================================
void connectWiFi() {
  Serial.print("Connecting to Wi-Fi: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.persistent(false);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  // Wait up to 15 s on first boot; loop() handles later drops without blocking
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Wi-Fi connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Wi-Fi not connected yet, will keep retrying...");
  }
}

void maintainWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  unsigned long now = millis();
  if (now - lastWifiTry >= WIFI_RETRY_MS) {
    lastWifiTry = now;
    Serial.println("Wi-Fi lost. Reconnecting...");
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }
}

// ==================================
// MQTT
// ==================================
bool connectMQTT() {
  Serial.print("Connecting to MQTT broker ");
  Serial.print(MQTT_BROKER);
  Serial.print("... ");

  bool ok;
  if (strlen(MQTT_USER) > 0) {
    ok = mqttClient.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASS,
                            MQTT_STATUS_TOPIC, 1, true, "offline");
  } else {
    ok = mqttClient.connect(MQTT_CLIENT_ID, nullptr, nullptr,
                            MQTT_STATUS_TOPIC, 1, true, "offline");
  }

  if (ok) {
    Serial.println("connected.");
    mqttClient.publish(MQTT_STATUS_TOPIC, "online", true);
  } else {
    Serial.print("failed, rc=");
    Serial.println(mqttClient.state());
  }
  return ok;
}

void maintainMQTT() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (mqttClient.connected()) return;

  unsigned long now = millis();
  if (now - lastMqttTry >= MQTT_RETRY_MS) {
    lastMqttTry = now;
    connectMQTT();
  }
}

// ==================================
// SENSORS
// ==================================
float readDistanceCm(bool &valid) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(5);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);

  if (duration > 0) {
    valid = true;
    return duration * 0.0343 / 2.0;
  }
  valid = false;
  return -1;
}

void publishSensorData() {
  // 1. Ultrasonic
  bool distValid;
  float distanceCm = readDistanceCm(distValid);

  // 2. Soil moisture
  int soilRaw = analogRead(soilPin);
  int soilPercent = map(
    constrain(soilRaw, soilWet, soilDry),
    soilDry,
    soilWet,
    0,
    100
  );

  // 3. BH1750 ambient light intensity
  float lux = lightMeter.readLightLevel();

  // Build JSON (distance_cm is null when there is no echo)
  char distStr[16];
  if (distValid) snprintf(distStr, sizeof(distStr), "%.2f", distanceCm);
  else           snprintf(distStr, sizeof(distStr), "null");

  char lightStr[20];
  if (lux >= 0) snprintf(lightStr, sizeof(lightStr), "%.2f", lux);
  else          snprintf(lightStr, sizeof(lightStr), "null");

  char payload[320];
  snprintf(payload, sizeof(payload),
           "{\"distance_cm\":%s,"
           "\"soil_raw\":%d,\"soil_percent\":%d,"
           "\"light_lux\":%s,"
           "\"rssi\":%d}",
           distStr,
           soilRaw, soilPercent,
           lightStr,
           WiFi.RSSI());

  Serial.print("Publishing to ");
  Serial.print(MQTT_TOPIC);
  Serial.print(": ");
  Serial.println(payload);

  if (!mqttClient.publish(MQTT_TOPIC, payload)) {
    Serial.println("Publish failed.");
  }
}

// ==================================
// SETUP / LOOP
// ==================================
void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  analogReadResolution(12);

  Wire.begin(I2C_SDA_PIN, I2C_SCL_PIN);
  if (lightMeter.begin(BH1750::CONTINUOUS_HIGH_RES_MODE)) {
    Serial.println("BH1750 light sensor ready!");
  } else {
    Serial.println("ERROR: BH1750 not detected!");
    Serial.println("Check SDA, SCL, VCC, and GND.");
    while (1) {
      delay(100);
    }
  }

  Serial.println();
  Serial.println("==================================");
  Serial.println(" ESP32 SENSOR NODE - MQTT");
  Serial.println(" Ultrasonic | Soil Moisture | BH1750 Light");
  Serial.println("==================================");

  connectWiFi();

  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setBufferSize(512);
  mqttClient.setKeepAlive(30);
}

void loop() {
  maintainWiFi();
  maintainMQTT();
  mqttClient.loop();   // keeps the MQTT connection alive

  unsigned long now = millis();
  if (now - lastPublish >= PUBLISH_INTERVAL_MS) {
    lastPublish = now;

    if (mqttClient.connected()) {
      publishSensorData();
    } else {
      Serial.println("MQTT offline, skipping publish.");
    }
  }
}
