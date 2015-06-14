node build/build.js && find ./test -name '*test.js' | xargs node_modules/.bin/mocha -R spec
