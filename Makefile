.PHONY: start-db stop-db rm-db logs-db \
        start-app start-api up down prune

COMPOSE_FILE=docker/docker-compose.yaml

## K8s ##
deploy-containers:
	@echo "Setting up the demo environment..."
	./litmus_chaos/deployments.sh

delete-cluster:
	kind delete cluster --name clusterbusters

litmus-access:
	kubectl apply -f litmus_chaos/access
	kubectl patch configmap subscriber-config -n litmus --type merge -p '{"data":{"SERVER_ADDR":"http://chaos-litmus-frontend-service.litmus.svc.cluster.local:9091/api/query"}}'

start-port-forward:
	@bash -c '\
	kubectl port-forward -n monitoring svc/prometheus-kube-prometheus-prometheus 9090:9090 & \
	sleep 5; \
	kubectl port-forward -n litmus service/chaos-litmus-frontend-service 9091:9091 & \
	wait'
	@echo "Port-forwarding started. Access Prometheus at http://localhost:9090 and Litmus at http://localhost:9091"

kill-port-forwards:
	@echo "Killing all Kubernetes port-forward processes..."
	@ps aux | grep 'kubectl port-forward' | grep -v grep | awk '{print $$2}' | xargs -r kill -9
	@echo "All port-forward processes killed."

## MongoDB ##
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


## App ##
start-app:
	python3 src/main.py

## API ##
start-api:
	python3 -m uvicorn src.api.server:app --reload --port 8000 & echo $$! > .api.pid

## Combined ##
up:
	$(MAKE) start-db
	sleep 3
	$(MAKE) start-mongo-express
	sleep 3
	./setup.sh
	$(MAKE) -j2 start-api start-app

down: kill-port-forwards
	pkill -f "src/main.py" || true
	pkill -f "uvicorn src.api.server:app" || true
	docker-compose -f $(COMPOSE_FILE) stop

prune: down
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans


## Models ##
test-model:
	./test/run_predictions.sh data/k8s_chaos_data_test.csv --model rf
	./test/run_predictions.sh data/k8s_chaos_data_test.csv --model nn

.PHONY: kill-api
kill-api:
	@echo "Terminating process on port 8000..."
	@kill -9 $$(lsof -t -i:8000 -sTCP:LISTEN) 2>/dev/null || echo "No process found on port 8000."
