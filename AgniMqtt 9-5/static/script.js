const tempEl = document.getElementById("room-temp");
const peakEl = document.getElementById("peak-temp");
const locEl = document.getElementById("location");
const fireEl = document.getElementById("fire-status");

const ctx = document.getElementById("tempChart").getContext("2d");
const dataPoints = new Array(10).fill(0);

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6', 'Z7', 'Z8', 'Z9', 'Z10'],
        datasets: [{
            label: 'Temperature (°C)',
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
            data: dataPoints,
        }]
    },
    options: {
        responsive: true,
        animation: false,
        scales: {
            y: {
                beginAtZero: true,
                suggestedMax: 100
            }
        }
    }
});

setInterval(() => {
    fetch('/data')
        .then(res => res.json())
        .then(data => {
            const temps = data.temperatures;
            chart.data.datasets[0].data = temps;
            chart.update();


            // Fire detection logic
            const alarmInput = document.querySelector('input[type="number"]');
            const alarmTemp = parseFloat(alarmInput.value) || 60;

            let fireDetected = temps.some(t => t > alarmTemp);
            document.getElementById("fire-status").innerText = fireDetected ? "FIRE!" : "SAFE";
            document.getElementById("fire-status").style.backgroundColor = fireDetected ? "red" : "green";

            document.getElementById("room-temp").innerText = `25°C`;
            document.getElementById("peak-temp").innerText = `${Math.max(...temps)} °C`;
            document.getElementById("location").innerText = `Z${temps.indexOf(Math.max(...temps)) + 1}`;

            // Update LED colors
            for (let i = 0; i < 10; i++) {
                const led = document.getElementById(`led${i + 1}`);
                if (temps[i] > alarmTemp) {
                    led.classList.remove("green");
                    led.classList.add("red");
                } else {
                    led.classList.remove("red");
                    led.classList.add("green");
                }
            }

        });
}, 5000);