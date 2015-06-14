# amodro-base

Wraps amodro-lifecycle with a loader implementation. The build from this repo can generate an AMD loader with some optional features.

## Directory layout

`parts/main.js` is the main implementation file. It is built using `build/build.js` and results in a set of `amodro*.js` files in this directory.

For a browser based implementation, the plan is to expand the build.js to swap in alternative versions of some of the files, like a different `parts/fetch.js`.

Not well documented yet: the goal right now is to port of as many requirejs/alameda tests that make sense to prove out the operation of Lifecycle.

`test-amd.sh` can be run to do the builds and then run the local tests. Check out [amodro-requirejs-tests](https://github.com/amodrojs/amodro-requirejs-tests) as as sibling to this directory to use those modified tests with the loaders generated here.
