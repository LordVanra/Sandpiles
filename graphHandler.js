const addConnectionBtn = document.getElementById('add-connection');
const removeConnectionBtn = document.getElementById('remove-connection');
const addDropperBtn = document.getElementById('add-dropper');



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

    setInterval(() => {
        dropSand(nodeId, true);
    }, 100);
}

function initGraph(size) {
    fetch(`/api/graph?size=${size}`)
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
                    .backgroundColor('rgba(0,0,0,0)'); // Ensure transparency
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
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    node.sand += 1;
    let avalancheSize = 0;

    if (node.sand >= node.capacity) {
        node.sand = 0;
        avalancheSize = 1;
        const neighbors = adjacency[nodeId] || [];
        neighbors.forEach(neighborId => {
            try {
                avalancheSize += dropSand(neighborId);
            } catch (e) {
                document.querySelector('.log').innerText += `\nSandpile Overfull`;
            }
        });
    }

    Graph.nodeColor(Graph.nodeColor());

    if (log && avalancheSize > 0) {
        document.querySelector('.log').innerText += `\nAvalanche Size: ${avalancheSize}`;
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
        labels: Array.from({ length: 20 }, (_, i) => i + 1),
        datasets: [{
            label: 'Topple Frequency',
            data: Array.from({ length: 20 }, () => Math.pow(10, Math.random() * 5)),
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
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#94a3b8', font: { size: 10 } }
            },
            y: {
                type: 'logarithmic',
                min: 1,
                max: 100000,
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                afterBuildTicks: (axis) => {
                    const ticks = [1, 10, 100, 1000, 10000, 100000];
                    axis.ticks = ticks.map(v => ({ value: v }));
                },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    callback: (value) => value.toLocaleString()
                }
            }
        }
    }
});