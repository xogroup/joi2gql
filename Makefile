NAME=samueljoli/xo-joiql
VERSION=latest
OSTYPE := $(shell uname)

test:
	npm run test

install:
	@rm -rf ./node_modules
	npm install

lint:
	node_modules/.bin/eslint --fix src/ test/

.PHONY: test install lint