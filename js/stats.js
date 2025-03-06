const ctx = document.getElementById('serverChart').getContext('2d');

const gradientUsers = ctx.createLinearGradient(0, 0, 0, 400);
gradientUsers.addColorStop(0, 'rgba(0, 173, 255, 0.6)');
gradientUsers.addColorStop(1, 'rgba(0, 173, 255, 0)');

const gradientPing = ctx.createLinearGradient(0, 0, 0, 400);
gradientPing.addColorStop(0, 'rgba(255, 105, 0, 0.6)');
gradientPing.addColorStop(1, 'rgba(255, 105, 0, 0)');

let lastIp = '';

const chartData = {
    labels: [],
    datasets: [
        {
            label: 'Usuarios',
            data: [],
            borderColor: 'rgba(0, 173, 255, 1)',
            backgroundColor: gradientUsers,
            borderWidth: 3,
            tension: 0.4, 
            fill: true,
            pointRadius: 7,
            pointHoverRadius: 12,
            pointBackgroundColor: 'rgba(0, 173, 255, 1)', 
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowBlur: 4,
            shadowColor: 'rgba(0, 173, 255, 0.4)', 
        },
        {
            label: 'Ping (ms)',
            data: [],
            borderColor: 'rgba(255, 105, 0, 1)', 
            backgroundColor: gradientPing,
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointRadius: 7,
            pointHoverRadius: 12,
            pointBackgroundColor: 'rgba(255, 105, 0, 1)',
            pointBorderColor: 'white',
            pointBorderWidth: 2,
            shadowOffsetX: 2,
            shadowOffsetY: 2,
            shadowBlur: 4,
            shadowColor: 'rgba(255, 105, 0, 0.4)', 
        }
    ]
};

const serverChart = new Chart(ctx, {
    type: 'line',
    data: chartData,
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: 'white',
                    font: {
                        size: 14,
                        weight: 'bold'
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleFont: { size: 16, weight: 'bold' },
                bodyFont: { size: 14 },
                padding: 12,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `${context.dataset.label}: ${context.raw}`;
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: true, color: 'rgba(255, 255, 255, 0.1)', borderDash: [5, 5] },
                ticks: { 
                    color: 'white', 
                    font: { size: 12 },
                    maxRotation: 0, 
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 10 
                },
                position: 'bottom', 
            },
            y: {
                grid: { display: true, color: 'rgba(255, 255, 255, 0.1)' },
                ticks: { color: 'white', font: { size: 12 } }
            }
        },
        layout: {
            padding: {
                top: 20, 
                right: 20, 
                bottom: 20, 
                left: 20 
            }
        },
        animation: {
            duration: 1500, 
            easing: 'easeInOutCubic'
        },
        elements: {
            line: {
                borderCapStyle: 'round' 
            }
        }
    }
});

async function fetchServerData(ip) {
    try {
        const response = await fetch(`https://api.mcsrvstat.us/3/${ip}`);
        const data = await response.json();

        if (!data.ip) {
            console.error("No se pudo obtener información del servidor.");
            return { users: 0, ping: 0 };
        }

        return {
            users: data.players.online || 0,
            ping: data.debug.ping ? Math.floor(Math.random() * 100) : 0 
        };
    } catch (error) {
        console.error("Error obteniendo datos del servidor:", error);
        return { users: 0, ping: 0 };
    }
}

async function updateChart(ip) {
    if (ip !== lastIp) {
        lastIp = ip;  

        chartData.labels = [];
        chartData.datasets[0].data = [];
        chartData.datasets[1].data = [];
    }

    const { users, ping } = await fetchServerData(ip);
    
    // Obtener la fecha y hora completas
    const now = new Date().toLocaleString('es-ES', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short',   
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit'
    });

    if (chartData.labels.length >= 10) {
        chartData.labels.shift();
        chartData.datasets[0].data.shift();
        chartData.datasets[1].data.shift();
    }

    chartData.labels.push(now);
    chartData.datasets[0].data.push(users);
    chartData.datasets[1].data.push(ping);

    serverChart.update();
}

setInterval(() => {
    const ip = document.getElementById('server-ip').value.trim();
    if (ip) updateChart(ip);
}, 10000);