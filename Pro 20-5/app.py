from flask import Flask, render_template, jsonify
import paho.mqtt.client as mqtt
from threading import Thread

app = Flask(__name__)

# Dictionary to store the latest temperature values received from MQTT
# Initialized with 1000 zeros (representing distance points)
latest_data = {"temperatures": [0.0]*1000}

# Callback function triggered whenever an MQTT message is received
def on_message(client, userdata, msg):
    try:
        # Convert incoming CSV string to a list of floats
        temps = list(map(float, msg.payload.decode().split(",")))
        # Update only if exactly 1000 values are received
        if len(temps) == 1000:
            latest_data["temperatures"] = temps
            print(f"[MQTT] Received 1000 values")
    except Exception as e:
        # Log any errors during processing
        print(f"Error processing MQTT message: {e}")

# Set up MQTT client and configure connection
client = mqtt.Client()
client.on_message = on_message
client.connect("localhost", 1883, 60)  # Connect to local MQTT broker
client.subscribe("agnirakshak/temperature")  # Subscribe to temperature topic

# Run MQTT client loop in a background thread
# This keeps listening for messages without blocking Flask
def mqtt_loop():
    client.loop_forever()

mqtt_thread = Thread(target=mqtt_loop, daemon=True)
mqtt_thread.start()

# Route for the main webpage (renders HTML UI)
@app.route('/')
def index():
    return render_template('index.html')

# Route for the frontend to fetch latest sensor data as JSON
@app.route('/data')
def data():
    return jsonify(latest_data)

# Start the Flask server on all network interfaces at port 3000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000, debug=True)
