import networkx as nx

def create_random_2_regular(n1, n2):
    G = nx.grid_graph(dim=[n1, n1, n2])
    return nx.convert_node_labels_to_integers(G)
