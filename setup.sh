#!/bin/bash

set -e

KIND_VERSION="v0.27.0"
CLUSTER_NAME="clusterbusters"
PROM_RELEASE_NAME="prometheus"
PROM_NAMESPACE="monitoring"

RESET=false
FORCE=false

# Parse arguments
for arg in "$@"; do
  case $arg in
    --reset)
      RESET=true
      shift
      ;;
    --force)
      FORCE=true
      shift
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: $0 [--reset] [--force]"
      exit 1
      ;;
  esac
done

# Reset: delete cluster and prometheus
if [ "$RESET" = true ]; then
  echo "Reset flag detected: deleting cluster and Prometheus..."

  if kind get clusters | grep -q "^$CLUSTER_NAME$"; then
    kind delete cluster --name "$CLUSTER_NAME"
    echo "Deleted kind cluster '$CLUSTER_NAME'."
  fi

  if helm list -n "$PROM_NAMESPACE" | grep -q "^$PROM_RELEASE_NAME"; then
    helm uninstall "$PROM_RELEASE_NAME" -n "$PROM_NAMESPACE"
    echo "Uninstalled Prometheus release."
  fi

  if kubectl get namespace "$PROM_NAMESPACE" >/dev/null 2>&1; then
    kubectl delete namespace "$PROM_NAMESPACE"
    echo "Deleted namespace '$PROM_NAMESPACE'."
  fi
fi

# Check if kind is installed
if command -v kind >/dev/null 2>&1; then
  echo "kind is already installed: $(kind --version)"
else
  OS="$(uname -s)"
  ARCH="$(uname -m)"

  echo "Detected OS: $OS"
  echo "Detected Architecture: $ARCH"

  case "$OS" in
    "Linux")
      if [ "$ARCH" = "x86_64" ]; then
        URL="https://kind.sigs.k8s.io/dl/$KIND_VERSION/kind-linux-amd64"
      elif [ "$ARCH" = "aarch64" ]; then
        URL="https://kind.sigs.k8s.io/dl/$KIND_VERSION/kind-linux-arm64"
      else
        echo "Unsupported Linux architecture: $ARCH"
        exit 1
      fi
      ;;
    "Darwin")
      if [ "$ARCH" = "x86_64" ]; then
        URL="https://kind.sigs.k8s.io/dl/$KIND_VERSION/kind-darwin-amd64"
      elif [ "$ARCH" = "arm64" ]; then
        URL="https://kind.sigs.k8s.io/dl/$KIND_VERSION/kind-darwin-arm64"
      else
        echo "Unsupported macOS architecture: $ARCH"
        exit 1
      fi
      ;;
    *)
      echo "Unsupported OS: $OS"
      exit 1
      ;;
  esac

  echo "Downloading kind from: $URL"
  curl -Lo ./kind "$URL"
  chmod +x ./kind

  if [ "$OS" = "Linux" ]; then
    echo "Installing to /usr/local/bin/kind"
    sudo mv ./kind /usr/local/bin/kind
  elif [ "$OS" = "Darwin" ]; then
    INSTALL_PATH="/usr/local/bin/kind"
    echo "Installing to $INSTALL_PATH"
    mv ./kind "$INSTALL_PATH" || sudo mv ./kind "$INSTALL_PATH"
  fi

  echo "kind installed successfully!"
fi

# Create kind cluster if not exists
if kind get clusters | grep -q "^$CLUSTER_NAME$"; then
  echo "kind cluster '$CLUSTER_NAME' already exists."
else
  echo "Creating a multi-node kind cluster '$CLUSTER_NAME'..."

  # Generate the kind cluster config
  cat <<EOF > kind-config.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
EOF

  # Create the cluster with the config
  kind create cluster --name "$CLUSTER_NAME" --config kind-config.yaml
  echo "kind cluster '$CLUSTER_NAME' created successfully!"

  # Cleanup
  rm -f kind-config.yaml
fi

# Wait for kind cluster nodes to be ready
echo "Waiting for cluster nodes to become Ready..."
kubectl wait --for=condition=Ready nodes --all --timeout=120s || {
  echo "Cluster nodes not ready in time."
  exit 1
}

# Verify kubectl can access the cluster
if ! kubectl cluster-info > /dev/null 2>&1; then
  echo "kubectl cannot access the Kubernetes cluster. Exiting."
  exit 1
fi

# Prometheus installation
if helm list -n "$PROM_NAMESPACE" | grep -q "^$PROM_RELEASE_NAME"; then
  if [ "$FORCE" = true ]; then
    echo "Force flag detected: reinstalling Prometheus..."
    helm uninstall "$PROM_RELEASE_NAME" -n "$PROM_NAMESPACE"
    kubectl delete namespace "$PROM_NAMESPACE" || true

    echo "Installing Prometheus in namespace '$PROM_NAMESPACE'..."
    helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
    helm repo update
    helm install "$PROM_RELEASE_NAME" prometheus-community/kube-prometheus-stack -n "$PROM_NAMESPACE" --create-namespace
    echo "Prometheus installed successfully!"
  else
    echo "Prometheus is already installed. Skipping installation."
  fi
else
  echo "Installing Prometheus in namespace '$PROM_NAMESPACE'..."
  helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
  helm repo update
  helm install "$PROM_RELEASE_NAME" prometheus-community/kube-prometheus-stack -n "$PROM_NAMESPACE" --create-namespace
  echo "Prometheus installed successfully!"
fi

# Wait for Prometheus pods to be ready
echo "Waiting for all pods in namespace '$PROM_NAMESPACE' to be ready..."
ATTEMPTS=36  # 36 * 5s = 180 seconds
SLEEP=5

for ((i=1; i<=ATTEMPTS; i++)); do
  NOT_READY=$(kubectl get pods -n "$PROM_NAMESPACE" --no-headers | awk '
  {
    split($2, ready, "/");
    if (ready[1] != ready[2] || ($3 != "Running" && $3 != "Completed")) {
      print;
    }
  }' | wc -l)

  if [ "$NOT_READY" -eq 0 ]; then
    echo "All pods in '$PROM_NAMESPACE' are ready!"
    break
  fi

  echo "Waiting for pods to be ready... ($i/$ATTEMPTS)"
  sleep $SLEEP
done

# Final pod status summary
echo "Final pod statuses in namespace '$PROM_NAMESPACE':"
kubectl get pods -n "$PROM_NAMESPACE"

# Port-forward Prometheus
echo "Starting port-forward for Prometheus at http://localhost:9090 ..."
nohup kubectl port-forward -n "$PROM_NAMESPACE" svc/prometheus-kube-prometheus-prometheus 9090:9090 > /dev/null 2>&1 &
PROM_PID=$!

ps aux | grep "kubectl port-forward" | grep -v grep

echo ""
echo "Access Prometheus UI: http://localhost:9090"
echo ""
echo "To stop port-forwarding:"
echo "  kill $PROM_PID"

helm repo add litmuschaos https://litmuschaos.github.io/litmus-helm/
helm repo list

kubectl create ns litmus --dry-run=client -o yaml | kubectl apply -f -

LITMUS_RELEASE_NAME="chaos"
LITMUS_NAMESPACE="litmus"

if helm list -n "$LITMUS_NAMESPACE" | grep -q "^$LITMUS_RELEASE_NAME"; then
  if [ "$FORCE" = true ]; then
    echo "Force flag detected: reinstalling Litmus..."
    helm uninstall "$LITMUS_RELEASE_NAME" -n "$LITMUS_NAMESPACE"
    sleep 5  # Give some time for the release to clear
  else
    echo "Litmus is already installed in namespace '$LITMUS_NAMESPACE'. Skipping installation."
    SKIP_LITMUS_INSTALL=true
  fi
fi

if [ "$SKIP_LITMUS_INSTALL" != true ]; then
  echo "Installing Litmus in namespace '$LITMUS_NAMESPACE'..."
  helm install "$LITMUS_RELEASE_NAME" litmuschaos/litmus --namespace="$LITMUS_NAMESPACE" \
    --set portal.frontend.service.type=NodePort \
    --set mongodb.image.registry=docker.io \
    --set mongodb.image.repository=dlavrenuek/bitnami-mongodb-arm \
    --set mongodb.image.tag=6.0.13
  echo "Litmus installed successfully!"
fi

# Wait for Litmus pods to be ready
echo "Waiting for all pods in namespace 'litmus' to be ready..."
ATTEMPTS=36  # 36 * 5s = 180 seconds
SLEEP=5

for ((i=1; i<=ATTEMPTS; i++)); do
  NOT_READY=$(kubectl get pods -n "$LITMUS_NAMESPACE" --no-headers | awk '
  {
    split($2, ready, "/");
    status = $3;
    if (ready[1] != ready[2] && status != "Completed") {
      print;
    } else if (status != "Running" && status != "Completed") {
      print;
    }
  }' | wc -l)

  if [ "$NOT_READY" -eq 0 ]; then
    echo "All Litmus pods in '$LITMUS_NAMESPACE' are ready (Running or Completed)."
    break
  fi

  echo "Waiting for pods to be ready... ($i/$ATTEMPTS)"
  sleep $SLEEP
done

# Final pod status summary
echo "Final pod statuses in namespace 'litmus':"
kubectl get pods -n litmus
kubectl get svc -n litmus

# Port-forward Litmus frontend
echo "Starting port-forward for Litmus UI at http://localhost:9091 ..."
nohup kubectl port-forward -n litmus service/chaos-litmus-frontend-service 9091:9091 > /dev/null 2>&1 &
LITMUS_PID=$!

ps aux | grep "kubectl port-forward" | grep -v grep

echo ""
echo "Access Litmus UI: http://localhost:9091"
echo ""
echo "To stop port-forwarding:"
echo "  kill $LITMUS_PID"
