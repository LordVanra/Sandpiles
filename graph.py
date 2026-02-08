import networkx as nx

def create_random_2_regular(n):
    G = nx.grid_graph(dim=[n, n])
    return nx.convert_node_labels_to_integers(G)
