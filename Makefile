.PHONY: start-db stop-db rm-db logs-db \
        start-app start-api up down prune

COMPOSE_FILE=docker/docker-compose.yaml

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

kill-port-forwards:
	@echo "Killing all Kubernetes port-forward processes..."
	@ps aux | grep 'kubectl port-forward' | grep -v grep | awk '{print $$2}' | xargs -r kill -9
	@echo "All port-forward processes killed."

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
