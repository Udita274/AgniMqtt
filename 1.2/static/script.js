const tempEl = document.getElementById("room-temp");
const peakEl = document.getElementById("peak-temp");
const locEl = document.getElementById("location");
const fireEl = document.getElementById("fire-status");

const ctx = document.getElementById("tempChart").getContext("2d");
const dataPoints = new Array(10).fill(0);

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: Array.from({ length: 1000 }, (_, i) => `Z${Math.floor(i / 100) + 1}.${i % 100}`),
        datasets: [{
            label: 'Temperature (°C)',
            borderColor: 'rgba(255, 99, 132, 0.8)',
            backgroundColor: 'rgba(255, 99, 132, 0.3)',
            data: [],
            fill:false,
            pointRadius: 0,
            pointHoverRadius:0
        }]
    },
    options: {
        responsive: true,
        animation: false,
            scales: {
                x: {
                title: {
                    display: true,
                    text: 'Distance Zones'
            },
                ticks: {
                    callback: function(val, index) {
                        return index % 100 === 0 ? `Z${index / 100 + 1}` : '';
                    },
                    maxTicksLimit: 10
                }
            },
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
            document.getElementById("location").innerText = `${temps.indexOf(Math.max(...temps))} m`;

            // Update LED colors
            // Update Hot Zone LEDs
for (let z = 0; z < 10; z++) {
    const start = z * 100;
    const end = start + 100;
    const zoneTemps = temps.slice(start, end);
    const led = document.getElementById(`led${z + 1}`);

    const hasFire = zoneTemps.some(t => t > alarmTemp);
    led.classList.toggle("red", hasFire);
    led.classList.toggle("green", !hasFire);
}


        });
}, 5000);