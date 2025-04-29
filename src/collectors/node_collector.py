"""
Collector for node metrics.
"""

from core.prometheus import get_metric_value
from config.settings import NODE_QUERIES



import subprocess

def get_node_ip(node_name):
    """
    Get the IP address of a node by its name.
    
    Args:
        node_name (str): Name of the node
        
    Returns:
        str: IP address of the node
    """
    try:
        # Get the node's InternalIP using kubectl
        ip_address = subprocess.check_output(
            ["kubectl", "get", "node", node_name, "-o", "jsonpath={.status.addresses[?(@.type==\"InternalIP\")].address}"]
        ).decode("utf-8").strip()
        return ip_address
    except subprocess.CalledProcessError as e:
        print(f"Error fetching IP for node {node_name}: {e}")
        return None



def collect_node_metrics(node_name):
    """
    Collect metrics for a specific node.

    Args:
        node_name (str): Name of the node

    Returns:
        dict: Dictionary of node metrics
    """
    node_metrics = { "node_name": node_name }

    # Get node's internal IP
    node_ip = get_node_ip(node_name)
    if node_ip is None:
        return {"error": "Unable to fetch node IP"}

    # Add :9100 for instance-based metrics
    instance_with_port = f"{node_ip}:9100"

    # Replace {node} with node name and {instance} with node IP:port in the queries
    for metric_name, query_template in NODE_QUERIES.items():
        query = query_template.replace("{node}", node_name).replace("{instance}", instance_with_port)
        node_metrics[metric_name] = get_metric_value(query)

    return node_metrics


def collect_all_nodes_metrics(nodes):
    """
    Collect metrics for all nodes.
    
    Args:
        nodes (list): List of node names
        
    Returns:
        dict: Dictionary mapping node names to their metrics
    """
    node_data = {}
    
    for node in nodes:
        node_data[node] = collect_node_metrics(node)
        
    return node_data