import time
import pandas as pd

# Core components
from core.k8s_client import (
    initialize_k8s_client, get_k8s_pods, get_k8s_nodes, 
    get_k8s_deployments, get_k8s_events
)

# Utils
from utils.event_filter import (
    get_new_events, filter_events_for_node, filter_events_for_pod,
    # filter_events_for_deployment
)

# Collectors
from collectors.node_collector import collect_all_nodes_metrics
from collectors.pod_collector import collect_all_pods_metrics
# from collectors.deployment_collector import collect_all_deployments_metrics

# Analyzers
from analyzers.node_analyzer import check_node_errors, add_error_flags as add_node_error_flags
from analyzers.pod_analyzer import check_pod_errors, add_error_flags as add_pod_error_flags
# from analyzers.deployment_analyzer import check_deployment_errors, add_error_flags as add_deployment_error_flags

# Storage
from storage.csv_exporter import CSVExporter
from storage.mongo_exporter import MongoExporter

# Predictor
from predictor.predictor import predict_for_pod
from predictor.predictor import predict_for_node

# Settings
from config.settings import STORAGE_BACKEND, POLLING_INTERVAL


def log(message, level="INFO"):
    timestamp = pd.Timestamp.now().isoformat()
    print(f"[{level}] {timestamp} - {message}")

def main():
    log("Starting Kubernetes monitoring...")

    if not initialize_k8s_client():
        log("Failed to initialize Kubernetes client. Exiting.", level="ERROR")
        return

    exporter = MongoExporter() if STORAGE_BACKEND == "mongo" else CSVExporter()
    log(f"Initialized exporter: {type(exporter).__name__}")

    while True:
        try:
            timestamp = pd.Timestamp.now()
            log(f"Collecting metrics at {timestamp}...")

            # Gather Kubernetes data
            pods = get_k8s_pods()
            nodes = get_k8s_nodes()
            # deployments = get_k8s_deployments()
            all_events = get_k8s_events()
            new_events = get_new_events(all_events)

            # Collect metrics
            pod_metrics = collect_all_pods_metrics(pods)
            node_metrics = collect_all_nodes_metrics(nodes)
            #deployment_metrics = collect_all_deployments_metrics(deployments)

            # Process pod metrics
            combined_data_pods = []
            for pod_key, pod_metric in pod_metrics.items():
                namespace, pod_name = pod_key.split("/", 1)
                combined_metric = {"timestamp": timestamp.isoformat(), **pod_metric}
                pod_events = filter_events_for_pod(new_events, namespace, pod_name)
                pod_errors = check_pod_errors(pod_metric, pod_events)
                combined_metric = add_pod_error_flags(combined_metric, pod_errors)

                #Predict and append (Comment this line whenm capturing data for training)
                combined_metric = predict_for_pod(combined_metric)
                combined_data_pods.append(combined_metric)
                
            # Process node metrics with predictions and error flags
            combined_data_nodes = []
            for node_name, node_metric in node_metrics.items():
                combined_metric = {"timestamp": timestamp.isoformat(), "node_name": node_name, **node_metric}
                node_events = filter_events_for_node(new_events, node_name)
                node_errors = check_node_errors(node_metric, node_events)
                combined_metric = add_node_error_flags(combined_metric, node_errors)
                combined_metric = predict_for_node(combined_metric)
                combined_data_nodes.append(combined_metric)

            # Process node and deployment metrics
            #combined_data_nodes = [
               # {"timestamp": timestamp.isoformat(), "node_name": node_name, **node_metrics[node_name]} 
                #for node_name in node_metrics
            #]
            # combined_data_deployments = [
            #     {"timestamp": timestamp.isoformat(), **deployment_metrics[deployment_key]} 
            #     for deployment_key in deployment_metrics
            # ]
            

            # Export to selected backend
            if STORAGE_BACKEND == "mongo":
                log("Saving metrics to MongoDB...")
                pod_result = exporter.save_to_mongo(combined_data_pods, "pod_metrics")
                node_result = exporter.save_to_mongo(combined_data_nodes, "node_metrics")
                #deployment_result = exporter.save_to_mongo(combined_data_deployments, "deployment_metrics")
                log(f"Pod metrics: {pod_result}")
                log(f"Node metrics: {node_result}")
                #log(f"Deployment metrics: {deployment_result}")
            else:
                log("Saving metrics to CSV...")
                pod_file = exporter.save_to_csv(combined_data_pods, filename='k8s_pod_metrics.csv')
                node_file = exporter.save_to_csv(combined_data_nodes, filename='k8s_node_metrics.csv')
                #deployment_file = exporter.save_to_csv(combined_data_deployments, filename='k8s_deployment_metrics.csv')
                log(f"Pod metrics saved to: {pod_file}")
                log(f"Node metrics saved to: {node_file}")
                # log(f"Deployment metrics saved to: {deployment_file}")

            time.sleep(POLLING_INTERVAL)

        except KeyboardInterrupt:
            log("Monitoring stopped by user.", level="INFO")
            break
        except Exception as e:
            log(f"Error in monitoring loop: {e}", level="ERROR")
            time.sleep(POLLING_INTERVAL)


if __name__ == "__main__":
    main()
