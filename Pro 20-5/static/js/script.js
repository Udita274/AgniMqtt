// Get references to various elements on the page that will display system data
const tempEl = document.getElementById("room-temp");
const peakEl = document.getElementById("peak-temp");
const locEl = document.getElementById("location");
const fireEl = document.getElementById("fire-status");
const delaySelect = document.getElementById("delay-select");
const systemStatusEl = document.querySelector(".system-info p:nth-child(2)");
const lastUpdatedEl = document.querySelector(".system-info p:nth-child(3)");

// Set up the temperature chart using Chart.js with initial configuration
const ctx = document.getElementById("tempChart").getContext("2d");

// This array is prepared for future use but not actively used in current code
const dataPoints = new Array(10).fill(0);

// Configure the line chart for displaying temperature data over distance
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        // Generate labels in format Z1.0 to Z10.99 to represent distances
        labels: Array.from({ length: 1000 }, (_, i) => `Z${Math.floor(i / 100) + 1}.${i % 100}`),
        datasets: [{
            label: '', // No label shown on the graph line
            borderColor: 'rgb(235, 232, 78)', // Yellow line color
            data: [], // Will be populated dynamically from server data
            fill: false
        }]
    },
    options: {
        responsive: true,
        animation: false, // No animation for real-time responsiveness
        plugins: {
            legend: { display: false } // Hide the chart legend
        },
        scales: {
            // Configure X-axis (distance)
            x: {
                title: {
                    display: true,
                    text: 'Distance (m)',
                    color: 'white',
                    font: { family: 'Segoe UI', size: 16, weight: 'bold' }
                },
                ticks: {
                    color: 'white',
                    font: { size: 14, weight: 'bold' },
                    // Only show labels every 100 points to avoid clutter
                    callback: function(val, index) {
                        return index % 100 === 0 ? index : '';
                    },
                    maxTicksLimit: 10
                }
            },
            // Configure Y-axis (temperature)
            y: {
                beginAtZero: true,
                suggestedMax: 100,
                title: {
                    display: true,
                    text: 'T e m p e r a t u r e \xa0(°C)',
                    color: 'white',
                    font: { family: 'Segoe UI', size: 16, weight: 'bold' }
                },
                ticks: {
                    color: 'white',
                    font: { size: 14, weight: 'bold' }
                }
            }
        }
    }
});

// Get references to start and stop buttons for controlling monitoring
const startBtn = document.querySelector('.btn.green');
const stopBtn = document.querySelector('.btn.red');

let isMonitoring = false;       // Tracks whether monitoring is active
let pollingIntervalId = null;   // Stores interval ID for stopping polling
let lastStopTime = null;        // Time when monitoring was last stopped
let lastDataTime = null;        // Time of the last successful data update

// Updates the system status and time indicators on the UI
function updateSystemInfo() {
    if (isMonitoring) {
        systemStatusEl.innerText = "Status: Online";
        lastUpdatedEl.innerText = lastDataTime
            ? `Last Updated: ${lastDataTime.toLocaleTimeString()}`
            : "Last Updated: Now";
    } else {
        systemStatusEl.innerText = "Status: Offline";
        lastUpdatedEl.innerText = lastStopTime
            ? `Last Stopped: ${lastStopTime.toLocaleTimeString()}`
            : "Last Stopped: -";
    }
}

// Starts the monitoring process and polling when Start button is clicked
startBtn.addEventListener('click', () => {
    if (isMonitoring) {
        alert("Monitoring is already running.");
        return;
    }
    isMonitoring = true;
    alert("Monitoring Started");
    console.log("Monitoring Started");
    startDataPolling(); // Begin polling the server for data
    updateSystemInfo(); // Update status display
});

// Stops the monitoring and polling process when Stop button is clicked
stopBtn.addEventListener('click', () => {
    if (!isMonitoring) {
        alert("Monitoring is not running.");
        return;
    }
    isMonitoring = false;
    alert("Monitoring Stopped");
    console.log("Monitoring Stopped");
    stopDataPolling(); // Stop server polling
    lastStopTime = new Date();
    updateSystemInfo(); // Update UI
});

// Starts polling the server for temperature data at a specified interval
function startDataPolling() {
    const delay = parseInt(delaySelect.value, 10) * 1000; // Convert to milliseconds
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId); // Clear existing interval
    }
    pollData(delay); // Immediate first data fetch
    pollingIntervalId = setInterval(() => pollData(delay), delay); // Continue polling
}

// Stops the periodic polling by clearing the interval
function stopDataPolling() {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
}

// Fetches data from the server and updates the UI and chart accordingly
function pollData(delay) {
    if (!isMonitoring) return;

    fetch('/data') // Call the backend API
        .then(res => res.json()) // Convert response to JSON
        .then(data => {
            const temps = data.temperatures;

            // Update the chart with new temperature data
            chart.data.datasets[0].data = temps;
            chart.update();

            // Get user-defined fire alarm threshold (default to 60°C)
            const alarmInput = document.querySelector('input[type="number"]');
            const alarmTemp = parseFloat(alarmInput.value) || 60;

            // Determine if any temperature exceeds the threshold
            let fireDetected = temps.some(t => t > alarmTemp);
            fireEl.innerText = fireDetected ? "FIRE!" : "SAFE";
            fireEl.style.backgroundColor = fireDetected ? "red" : "green";

            // Simulate room temperature display (static 25°C)
            tempEl.innerText = `25°C`;

            // Display highest temperature detected and its location
            const maxTemp = Math.max(...temps);
            peakEl.innerText = `${maxTemp} °C`;
            locEl.innerText = `${temps.indexOf(maxTemp)} m`;

            // Update the status of 10 zone LEDs based on temperatures
            for (let z = 0; z < 10; z++) {
                const start = z * 100;
                const end = start + 100;
                const zoneTemps = temps.slice(start, end);
                const led = document.getElementById(`led${z + 1}`);

                const hasFire = zoneTemps.some(t => t > alarmTemp);
                led.classList.toggle("red", hasFire);
                led.classList.toggle("green", !hasFire);
            }

            // Update the timestamp of the last data update
            lastDataTime = new Date();
            updateSystemInfo();
        });
}

// Restart polling if delay is changed during active monitoring
delaySelect.addEventListener('change', () => {
    if (isMonitoring) {
        startDataPolling();
    }
});

// Select all elements with the class 'number-input'
document.querySelectorAll('.number-input').forEach(wrapper => {
  
  // Get the number input field inside this wrapper
  const input = wrapper.querySelector('input[type="number"]');

  // Get the up and down arrow buttons
  const up = wrapper.querySelector('.arrow.up');
  const down = wrapper.querySelector('.arrow.down');

  // When the up arrow is clicked
  up.addEventListener('click', () => {
    // If the input is empty, set it to 0
    if (input.value === '') input.value = 0;

    // If max is not set or current value is less than max, increment the value
    if (input.max === '' || Number(input.value) < Number(input.max)) {
      input.value = Number(input.value) + 1;

      // Dispatch a change event so any listeners can react
      input.dispatchEvent(new Event('change'));
    }
  });

  // When the down arrow is clicked
  down.addEventListener('click', () => {
    // If the input is empty, set it to 0
    if (input.value === '') input.value = 0;

    // If min is not set or current value is greater than min, decrement the value
    if (input.min === '' || Number(input.value) > Number(input.min)) {
      input.value = Number(input.value) - 1;

      // Dispatch a change event so any listeners can react
      input.dispatchEvent(new Event('change'));
    }
  });
});


// On page load, update system info and optionally start polling
updateSystemInfo();
startDataPolling(); // Optional: start polling by default on load