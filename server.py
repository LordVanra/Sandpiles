from flask import Flask, jsonify, request, send_from_directory
import networkx as nx
import os
from graph import create_random_2_regular

app = Flask(__name__, static_folder='.')

def serialize_graph(G):
    nodes = []
    for node in G.nodes():
        degree = G.degree(node)
        nodes.append({
            "id": node,
            "sand": 0,
            "capacity": 4,
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
    
    # Rerunning the graph generation logic
    G = create_random_2_regular(size)
    return jsonify(serialize_graph(G))

if __name__ == "__main__":
    app.run(debug=True, port=5000) # Start the server at port 5000
