import networkx as nx

def create_random_2_regular(n):
    # Creating a 3D grid graph
    G = nx.grid_graph(dim=[n, n, n])
    return nx.convert_node_labels_to_integers(G)
