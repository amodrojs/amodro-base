node build/build.js && find ./test-es -name '*test.js' | AMODRO=amodro-es-node xargs node_modules/.bin/mocha -R spec
