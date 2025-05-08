from flask import Flask, render_template, jsonify
from flask_cors import CORS
import paho.mqtt.client as mqtt
import threading

app = Flask(__name__)
CORS(app)

# Store latest data
latest_data = {"temperatures": [0.0]*10}

# MQTT config
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "agnirakshak/temperature"

# MQTT Callbacks
def on_connect(client, userdata, flags, rc):
    print("Connected to MQTT broker with code", rc)
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    try:
        temps= list(map(float, msg.payload.decode().split(",")))
        if len(temps) == 10:
            latest_data["temperatures"] = temps
            print(f"[MQTT] Temps: {temps}°C")
    except Exception as e:
        print("Error:", e)

# MQTT Thread
def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT)
    client.loop_forever()

# Flask Routes
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/data")
def data():
    return jsonify(latest_data)

if __name__ == "__main__":
    mqtt_thread = threading.Thread(target=start_mqtt)
    mqtt_thread.daemon = True
    mqtt_thread.start()
    app.run(debug=True, port=3000)
