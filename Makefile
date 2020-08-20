.PHONY: build run

NAME=mojaloop-payment-manager-management-api-service

default: build

build:
	docker build -t $(NAME) .
run:
	docker-compose up 
