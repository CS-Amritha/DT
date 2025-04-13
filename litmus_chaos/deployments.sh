#!/bin/bash

set -e

ACTION="create"

if [[ "$1" == "--delete" ]]; then
  ACTION="delete"
fi

namespaces=(
  "disk-fill-ns"
  "pod-autoscaler-ns"
  "pod-cpu-hog-ns"
  "pod-delete-ns"
  "pod-dns-ns"
  "pod-io-stress-ns"
  "pod-memory-hog-ns"
  "pod-network-ns"
  "pod-http-chaos-ns"
)

if [[ "$ACTION" == "delete" ]]; then
  echo "Deleting namespaces and all associated deployments for Litmus Chaos experiments..."
  for ns in "${namespaces[@]}"; do
    echo "Deleting namespace: $ns"
    kubectl delete namespace "$ns" --ignore-not-found=true
  done
  echo ""
  echo "All specified namespaces have been deleted."
  exit 0
fi

echo "Creating namespaces and deployments for Litmus Chaos experiments..."

create_and_label() {
  ns="$1"
  deploy="$2"
  image="$3"
  label="$4"
  shift 4
  cmd=("$@")

  kubectl create namespace "$ns" 2>/dev/null || true
  kubectl create deployment "$deploy" --image="$image" -n "$ns" -- "${cmd[@]}" 2>/dev/null || true
  kubectl label deployment "$deploy" -n "$ns" app="$label" --overwrite 2>/dev/null || true
}

# Disk Fill
create_and_label "disk-fill-ns" "disk-fill" "busybox" "disk-fill" sleep 3600

# Pod Autoscaler
create_and_label "pod-autoscaler-ns" "pod-autoscaler" "nginx" "pod-autoscaler"

# Pod CPU Hog
create_and_label "pod-cpu-hog-ns" "pod-cpu-hog-exec" "busybox" "pod-cpu-hog-exec" sleep 3600
create_and_label "pod-cpu-hog-ns" "pod-cpu-hog" "nginx" "pod-cpu-hog"

# Pod Delete
create_and_label "pod-delete-ns" "pod-delete" "nginx" "pod-delete"

# DNS Error & Spoof
create_and_label "pod-dns-ns" "pod-dns-error" "curlimages/curl" "pod-dns-error" sleep 3600
create_and_label "pod-dns-ns" "pod-dns-spoof" "curlimages/curl" "pod-dns-spoof" sleep 3600

# IO Stress
create_and_label "pod-io-stress-ns" "pod-io-stress" "busybox" "pod-io-stress" sh -c 'while true; do echo hello >> /data/file; sleep 1; done'

# Memory Hog
create_and_label "pod-memory-hog-ns" "pod-memory-hog-exec" "busybox" "pod-memory-hog-exec" sleep 3600
create_and_label "pod-memory-hog-ns" "pod-memory-hog" "nginx" "pod-memory-hog"

# Network Chaos
create_and_label "pod-network-ns" "pod-network-latency" "nginx" "pod-network-latency"
create_and_label "pod-network-ns" "pod-network-loss" "nginx" "pod-network-loss"
create_and_label "pod-network-ns" "pod-network-duplication" "nginx" "pod-network-duplication"
create_and_label "pod-network-ns" "pod-network-corruption" "nginx" "pod-network-corruption"
create_and_label "pod-network-ns" "pod-network-partition" "nginx" "pod-network-partition"

# HTTP Chaos
create_and_label "pod-http-chaos-ns" "pod-http-latency" "ealen/echo-server" "pod-http-latency"
create_and_label "pod-http-chaos-ns" "pod-http-reset-peer" "ealen/echo-server" "pod-http-reset-peer"
create_and_label "pod-http-chaos-ns" "pod-http-status-code" "ealen/echo-server" "pod-http-status-code"
create_and_label "pod-http-chaos-ns" "pod-http-modify-body" "ealen/echo-server" "pod-http-modify-body"
create_and_label "pod-http-chaos-ns" "pod-http-modify-header" "ealen/echo-server" "pod-http-modify-header"

echo ""
echo "All namespaces and deployments created with consistent labels."
