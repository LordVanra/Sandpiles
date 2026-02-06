const slider = document.getElementById('grid-size');
const sizeVal = document.getElementById('grid-size-val');
let Graph;
let adjacency = {};

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
        dropSand(nodeId);
    }, 400);
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
                    .nodeLabel(node => `Sand: ${node.sand} / ${node.capacity}`)
                    .nodeAutoColorBy('capacity')
                    .onNodeClick(node => dropSand(node.id))
                    .nodeColor(node => {
                        if (node.sand === 0) return '#cccccc';
                        const color = 255 - Math.floor(node.sand / node.capacity * 255);
                        const colorHex = color.toString(16).padStart(2, '0');
                        return `#ff${colorHex}00`;
                    });
            } else {
                Graph.graphData(data);
            }
        });
}

function dropSand(nodeId) {
    const { nodes } = Graph.graphData();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    node.sand += 1;

    if (node.sand >= node.capacity) {
        node.sand = 0;
        const neighbors = adjacency[nodeId] || [];
        neighbors.forEach(neighborId => {
            dropSand(neighborId);
        });
    }

    Graph.nodeColor(Graph.nodeColor());
}

let debounceTimer;
slider.oninput = function () {
    const val = this.value;
    sizeVal.innerText = val;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        initGraph(val);
    }, 10);
};

const addConnectionBtn = document.getElementById('add-connection');
const removeConnectionBtn = document.getElementById('remove-connection');
const addDropperBtn = document.getElementById('add-dropper');

addConnectionBtn.addEventListener('click', () => {
    const source = prompt('Enter source node ID:');
    const target = prompt('Enter target node ID:');
    addConnection(source, target);
});

removeConnectionBtn.addEventListener('click', () => {
    const source = prompt('Enter source node ID:');
    const target = prompt('Enter target node ID:');
    removeConnection(source, target);
});

addDropperBtn.addEventListener('click', () => {
    const nodeId = prompt('Enter node ID:');
    if (nodeId !== null) addDropper(nodeId);
});

initGraph(5);