install:
	npm ci

lint:
	npm eslint .

test:
	npm test

develop:
	npx webpack serve

build:
	rm -rf dist
	NODE_ENV=production npx webpack