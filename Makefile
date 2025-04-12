.PHONY: start-db stop-db restart-db rm-db logs-db \
        start-app stop-app restart-app rm-app \
        up all down prune logs

COMPOSE_FILE=docker/docker-compose.yaml

## MongoDB commands ##
start-db:
	docker-compose -f $(COMPOSE_FILE) up -d mongo

stop-db:
	docker-compose -f $(COMPOSE_FILE) stop mongo

restart-db: stop-db start-db

rm-db:
	docker-compose -f $(COMPOSE_FILE) rm -sfv mongo

logs-db:
	docker-compose -f $(COMPOSE_FILE) logs -f mongo

## App commands ##
start-app:
	python3 src/main.py

stop-app:
	pkill -f "python3 src/main.py" || true

restart-app: stop-app start-app

rm-app: stop-app 

## Combined ##
up: start-db start-app

down: stop-app stop-db

prune: down
	docker-compose -f $(COMPOSE_FILE) down -v --remove-orphans

logs: logs-db
