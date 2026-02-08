const addConnectionBtn = document.getElementById('add-connection');
const removeConnectionBtn = document.getElementById('remove-connection');
const addDropperBtn = document.getElementById('add-dropper');

let chartData = new Map();

let nodesQueue = [];

function addConnection(source, target) {
    source = parseInt(source);
    target = parseInt(target);
    if (isNaN(source) || isNaN(target)) return;

    const { nodes, links } = Graph.graphData();
    Graph.graphData({
        nodes,
        links: [...links, { source: source, target: target }]
    });

    if (!adjacency[source]) adjacency[source] = [];
    if (!adjacency[target]) adjacency[target] = [];
    if (!adjacency[source].includes(target)) adjacency[source].push(target);
    if (!adjacency[target].includes(source)) adjacency[target].push(source);

    const sNode = nodes.find(n => n.id === source);
    const tNode = nodes.find(n => n.id === target);
    if (sNode) sNode.capacity = adjacency[source].length;
    if (tNode) tNode.capacity = adjacency[target].length;
}

function removeConnection(source, target) {
    source = parseInt(source);
    target = parseInt(target);
    if (isNaN(source) || isNaN(target)) return;

    const { nodes, links } = Graph.graphData();
    Graph.graphData({
        nodes,
        links: links.filter(link => {
            const s = typeof link.source === 'object' ? link.source.id : link.source;
            const t = typeof link.target === 'object' ? link.target.id : link.target;
            return !((s === source && t === target) || (s === target && t === source));
        })
    });

    if (adjacency[source]) adjacency[source] = adjacency[source].filter(id => id !== target);
    if (adjacency[target]) adjacency[target] = adjacency[target].filter(id => id !== source);

    const sNode = nodes.find(n => n.id === source);
    const tNode = nodes.find(n => n.id === target);
    if (sNode) sNode.capacity = (adjacency[source] || []).length;
    if (tNode) tNode.capacity = (adjacency[target] || []).length;
}

function addDropper(nodeId) {
    nodeId = parseInt(nodeId);
    if (isNaN(nodeId)) return;
    const { nodes } = Graph.graphData();
    if (!nodes.find(n => n.id === nodeId)) return;

    const fastMode = document.getElementById('speed-switch').checked;
    if (fastMode) {
        setInterval(() => {
            dropSand(nodeId, true);
        }, 10);
    }
    else {
        setInterval(() => {
            dropSand(nodeId, true);
        }, 250);
    }
}

function initGraph(size) {
    const three_d = document.getElementById('feature-switch').checked;
    fetch(`/api/graph?size=${size}&three_d=${three_d}`)
        .then(res => res.json())
        .then(data => {
            adjacency = {};
            data.links.forEach(link => {
                const s = typeof link.source === 'object' ? link.source.id : link.source;
                const t = typeof link.target === 'object' ? link.target.id : link.target;
                if (!adjacency[s]) adjacency[s] = [];
                if (!adjacency[t]) adjacency[t] = [];
                adjacency[s].push(t);
                adjacency[t].push(s);
            });

            if (!Graph) {
                Graph = ForceGraph3D()
                    (document.getElementById('graph-container'))
                    .graphData(data)
                    .nodeRelSize(8)
                    .nodeLabel(node => `Sand: ${node.sand} / ${node.capacity}`)
                    .nodeAutoColorBy('capacity')
                    .onNodeClick(node => onNodeClick(node.id))
                    .linkColor(() => 'rgba(255, 255, 255, 1)')
                    .nodeColor(node => {
                        if (node.sand === 0) return '#cccccc';
                        const color = 255 - Math.floor(node.sand / node.capacity * 255);
                        const colorHex = color.toString(16).padStart(2, '0');
                        return `#ff${colorHex}00`;
                    })
                    .backgroundColor('rgba(0,0,0,0)');

                setTimeout(() => {
                    Graph.d3Force('charge').strength(-200);
                    Graph.d3Force('link').distance(40).iterations(12);
                    Graph.d3ReheatSimulation();
                }, 100);
            } else {
                Graph.graphData(data);
            }
        });
}

function onNodeClick(nodeId) {
    if (addConnectionBtn.classList.contains('active')) {
        nodesQueue.push(nodeId);
        if (nodesQueue.length === 2) {
            addConnection(nodesQueue.pop(), nodesQueue.pop());
        }
    }
    else if (removeConnectionBtn.classList.contains('active')) {
        nodesQueue.push(nodeId);
        if (nodesQueue.length === 2) {
            removeConnection(nodesQueue.pop(), nodesQueue.pop());
        }
    }
    else if (addDropperBtn.classList.contains('active')) {
        addDropper(nodeId);
    }
    else {
        dropSand(nodeId, true);
    }
}

function dropSand(nodeId, log = false) {
    const { nodes } = Graph.graphData();
    const queue = [nodeId];
    let avalancheSize = 0;

    while (queue.length > 0) {
        const nodeId = queue.shift();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;

        node.sand += 1;

        if (node.sand >= node.capacity) {
            avalancheSize++;

            node.sand = 0;
            const neighbors = adjacency[nodeId] || [];
            neighbors.forEach(neighborId => {
                queue.push(neighborId);
            });
        }
    }

    Graph.nodeColor(Graph.nodeColor());

    if (avalancheSize > 0) {
        if (log) {
            const logEl = document.querySelector('.log');
            logEl.innerText += `\nAvalanche: ${avalancheSize}`;
            if (logEl.innerText.length > 1000) logEl.innerText = logEl.innerText.slice(-1000);
            logEl.parentElement.scrollTop = logEl.parentElement.scrollHeight;
        }

        const currentCount = chartData.get(avalancheSize) || 0;
        chartData.set(avalancheSize, currentCount + 1);
        updateChart();
    }

    return avalancheSize;
}

const slider = document.getElementById('grid-size');
const sizeVal = document.getElementById('grid-size-val');

let Graph;
let adjacency = {};

let debounceTimer;
slider.oninput = function () {
    const val = this.value;
    sizeVal.innerText = val;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        initGraph(val);
    }, 10);
};

document.getElementById('feature-switch').onchange = function () {
    initGraph(slider.value);
};

addConnectionBtn.addEventListener('click', () => {
    const isActive = addConnectionBtn.classList.toggle('active');
    removeConnectionBtn.classList.remove('active');
    addDropperBtn.classList.remove('active');
    nodesQueue = [];
});

removeConnectionBtn.addEventListener('click', () => {
    const isActive = removeConnectionBtn.classList.toggle('active');
    addConnectionBtn.classList.remove('active');
    addDropperBtn.classList.remove('active');
    nodesQueue = [];
});

addDropperBtn.addEventListener('click', () => {
    const isActive = addDropperBtn.classList.toggle('active');
    addConnectionBtn.classList.remove('active');
    removeConnectionBtn.classList.remove('active');
    nodesQueue = [];
});

initGraph(5);

const ctx = document.getElementById('stats-chart').getContext('2d');
const statsChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Topple Frequency',
            data: [],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            fill: true
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false }
        },
        scales: {
            x: {
                type: 'logarithmic',
                title: { display: true, text: 'Avalanche Size (s)', color: '#94a3b8' },
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    callback: (value) => value.toLocaleString()
                }
            },
            y: {
                type: 'logarithmic',
                title: { display: true, text: 'Frequency P(s)', color: '#94a3b8' },
                min: 1,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    callback: (value) => value.toLocaleString()
                }
            }
        }
    }
});

function updateChart() {
    const sortedKeys = Array.from(chartData.keys()).sort((a, b) => a - b);
    statsChart.data.labels = sortedKeys;
    statsChart.data.datasets[0].data = sortedKeys.map(key => chartData.get(key));
    statsChart.update();
}

// Window resize handler
window.addEventListener('resize', () => {
    if (Graph) {
        Graph.width(document.getElementById('graph-container').offsetWidth);
        Graph.height(document.getElementById('graph-container').offsetHeight);
    }
});