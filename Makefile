# Variables
COMPOSE_FILE := docker/docker-compose.yaml
FRONTEND_DIR := frontend
FRONTEND_LOG := frontend.log
API_PID_FILE := .api.pid
FRONTEND_PID_FILE := frontend.pid
CLUSTER_NAME := clusterbusters

.PHONY: \
  deploy-containers delete-cluster litmus-access start-port-forward kill-port-forwards \
  start-db stop-db rm-db logs-db start-mongo-express \
  start-app start-api kill-api \
  start-frontend up down prune \
  test-model

## --- Kubernetes (K8s) Commands ---

deploy-containers:
	@echo "Setting up the demo environment..."
	./litmus_chaos/deployments.sh

delete-cluster:
	kind delete cluster --name $(CLUSTER_NAME)

litmus-access:
	kubectl apply -f litmus_chaos/access
	kubectl patch configmap subscriber-config -n litmus --type merge -p '{"data":{"SERVER_ADDR":"http://chaos-litmus-frontend-service.litmus.svc.cluster.local:9091/api/query"}}'

start-port-forward:
	@echo "Starting port forwarding for Prometheus and Litmus..."
	@bash -c '\
		kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090 & \
		sleep 5; \
		kubectl port-forward -n litmus service/chaos-litmus-frontend-service 9091:9091 & \
		wait'
	@echo "Access Prometheus at http://localhost:9090 and Litmus at http://localhost:9091"

kill-port-forwards:
	@echo "Killing all Kubernetes port-forward processes..."
	@ps aux | grep 'kubectl port-forward' | grep -v grep | awk '{print $$2}' | xargs -r kill -9
	@echo "All port-forward processes killed."

## --- MongoDB ---

start-db:
	docker-compose -f $(COMPOSE_FILE) up -d mongo

start-mongo-express:
	docker-compose -f $(COMPOSE_FILE) up -d mongo-express

stop-db:
	docker-compose -f $(COMPOSE_FILE) stop

rm-db:
	docker-compose -f $(COMPOSE_FILE) rm -sfv

logs-db:
	docker-compose -f $(COMPOSE_FILE) logs -f

## --- App ---

start-app:
	python3 src/main.py

## --- API ---

start-api:
	python3 -m uvicorn src.api.server:app --reload --port 8000 & echo $$! > $(API_PID_FILE)

kill-api:
	@echo "Terminating process on port 8000..."
	@kill -9 $$(lsof -t -i:8000 -sTCP:LISTEN) 2>/dev/null || echo "No process found on port 8000."
	@rm -f $(API_PID_FILE)

## --- Frontend ---

start-frontend:
	cd $(FRONTEND_DIR) && (nohup npm run dev > ../$(FRONTEND_LOG) 2>&1 & echo $$! > ../$(FRONTEND_PID_FILE))

## --- Combined Workflow ---

up:
	$(MAKE) start-db
	sleep 3
	$(MAKE) start-mongo-express
	sleep 3
	./setup.sh
	sleep 5
	$(MAKE) deploy-containers
	$(MAKE) -j3 start-api start-app start-frontend

down: kill-port-forwards kill-api
	@echo "Stopping backend and frontend..."
	-pkill -f "src/main.py" || true
	-pkill -f "uvicorn src.api.server:app" || true
	docker-compose -f $(COMPOSE_FILE) stop
	-[ -f $(FRONTEND_PID_FILE) ] && kill `cat $(FRONTEND_PID_FILE)` && rm -f $(FRONTEND_PID_FILE)

prune: down
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans

## --- Model Testing ---

test-model:
	./test/run_predictions.sh data/k8s_chaos_data_test.csv --model rf
	./test/run_predictions.sh data/k8s_chaos_data_test.csv --model nn
