import time
import random
import paho.mqtt.client as mqtt

broker = "broker.hivemq.com"
port = 1883

client = mqtt.Client()
client.connect(broker, port, 60)

while True:
    temperatures = [round(random.uniform(20.0, 60.0), 2) for _ in range(10)]  # Simulated temperature
    payload = ",".join(map(str, temperatures))

    client.publish("agnirakshak/temperature", payload)
    
    print(f"Published -> {payload}")
    time.sleep(5)
