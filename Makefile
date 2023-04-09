SHELL := /bin/bash
include .env
export

default:
	@echo "Makefile"
	@echo
	@echo "Following commands are available:"
	@echo
	@echo " - setup              : set-ups development workspace"

.PHONY: test
.ONESHELL:
MAKEFLAGS += --no-print-directory


clean:
	rm -rf node_modules

dev:
	npm run start:dev

build:
	npm run build

cleanlock:
	rm  package-lock.json

install:
	npm install

test:
	clear
	make install
	npm run test

