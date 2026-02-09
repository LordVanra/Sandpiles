from flask import Flask, jsonify, request, send_from_directory
import networkx as nx
import os
from graph import create_random_2_regular, create_hexagonal_grid, create_triangular_grid, create_torus, create_mobius_strip

app = Flask(__name__, static_folder='.')

def serialize_graph(G, three_d, shape):
    nodes = []
    for node in G.nodes():
        degree = G.degree(node)
        capacity = 4
        if shape == 'cube':
            capacity = 6
        elif shape == 'octahedron':
            capacity = 8
        elif shape == 'hexagon':
            capacity = 3
        elif shape == 'triangle':
            capacity = 6
        elif shape == 'mobius':
            capacity = 4
            
        nodes.append({
            "id": node,
            "sand": 0,
            "capacity": capacity,
            "val": 1
        })
    
    links = []
    for u, v in G.edges():
        links.append({"source": u, "target": v})
        
    return {"nodes": nodes, "links": links}

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/style.css')
def style():
    return send_from_directory('.', 'style.css')

@app.route('/graphHandler.js')
def script():
    return send_from_directory('.', 'graphHandler.js')

@app.route('/api/graph')
def get_graph():
    size = int(request.args.get('size', 5))
    three_d = request.args.get('three_d', 'false') == 'true'
    shape = request.args.get('shape', 'square')
    
    # Rerunning the graph generation logic
    if not three_d:
        if shape == 'hexagon':
            G = create_hexagonal_grid(size)
        elif shape == 'triangle':
            G = create_triangular_grid(size, size)
        else:
            G = create_random_2_regular(size, 1)
    elif three_d:
        if shape == 'cube':
            G = create_random_2_regular(size, size)
        elif shape == 'octahedron':
            G = create_octahedral_grid(size)
        elif shape == 'torus':
            G = create_torus(size)
        elif shape == 'mobius':
            G = create_mobius_strip(size)
    
    return jsonify(serialize_graph(G, three_d, shape))

if __name__ == "__main__":
    app.run(debug=True, port=5000) # Start the server at port 5000
