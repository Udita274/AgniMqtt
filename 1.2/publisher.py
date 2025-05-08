import time
import random
import paho.mqtt.client as mqtt

MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "agnirakshak/temperature"

client = mqtt.Client()
client.connect(MQTT_BROKER, MQTT_PORT, 60)

while True:
    temperatures = [round(random.uniform(20.0, 60.0), 2) for _ in range(1000)]  # Simulated temperature
    payload = ",".join(map(str, temperatures))

    client.publish(MQTT_TOPIC, payload)
    
    print(f"Published 1000 values.")
    time.sleep(5)
