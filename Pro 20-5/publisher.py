import paho.mqtt.client as mqtt
import time
import random

# MQTT broker configuration details
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "agnirakshak/temperature"

# Create an MQTT client instance
client = mqtt.Client()

# Callback function when client connects to the MQTT broker
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("✅ Connected to MQTT Broker")
    else:
        print(f"❌ Failed to connect, return code {rc}")

# Assign the connect callback to the client
client.on_connect = on_connect

# Connect to the MQTT broker
client.connect(MQTT_BROKER, MQTT_PORT, 60)

# Start a background loop to maintain network traffic with the broker
client.loop_start()

# Function to generate and publish 1000 temperature values
def publish_temperature():
    # Generate 999 normal temperatures between 25°C and 27°C
    normal_temperatures = [round(random.uniform(25.0, 27.0), 2) for _ in range(999)]

    # Generate 1 random high temperature between 50°C and 60°C
    high_temperature = [round(random.uniform(50.0, 60.0), 2)]

    # Combine all temperatures and shuffle their order
    temperatures = normal_temperatures + high_temperature
    random.shuffle(temperatures)

    # Convert list to comma-separated string
    payload = ",".join(map(str, temperatures))

    # Publish temperature data to the MQTT topic
    client.publish(MQTT_TOPIC, payload)

    print(f"Published 1000 values.")

# Main loop: publish data every 5 seconds
if __name__ == "__main__":
    while True:
        publish_temperature()
        time.sleep(5)
