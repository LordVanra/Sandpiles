import networkx as nx


def create_random_2_regular(n1, n2):
    G = nx.grid_graph(dim=[n1, n1, n2])
    return nx.convert_node_labels_to_integers(G)

def create_triangular_grid(n1, n2):
    G = nx.triangular_lattice_graph(n1, n1, n2)
    return nx.convert_node_labels_to_integers(G)

def create_hexagonal_grid(n1):
    G = nx.hexagonal_lattice_graph(n1, n1)
    return nx.convert_node_labels_to_integers(G)

def create_torus(n1):
    G = nx.grid_graph(dim=[n1, 2*n1], periodic=True)
    return nx.convert_node_labels_to_integers(G)

# def create_octahedral_grid(n):
#     G = nx.Graph()
    
#     for x in range(n):
#         for y in range(n):
#             for z in range(n):
#                 G.add_node((x, y, z))
    
#     for x in range(n - 1):
#         for y in range(n - 1):
#             for z in range(n - 1):
#                 center = (x + 0.5, y + 0.5, z + 0.5)
#                 G.add_node(center)
                
#                 for dx in [0, 1]:
#                     for dy in [0, 1]:
#                         for dz in [0, 1]:
#                             corner = (x + dx, y + dy, z + dz)
#                             G.add_edge(center, corner)
                            
def create_mobius_strip(n):
    width = n
    length = 3 * n
    G = nx.grid_graph(dim=[width, length], periodic=False)
    
    for y in range(width):
        left_node = (0, y)
        right_node = (length - 1, width - 1 - y)
        G.add_edge(left_node, right_node)
        
    return nx.convert_node_labels_to_integers(G)


