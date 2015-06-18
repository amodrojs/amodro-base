# Code structure

`parts/main.js` is the main implementation file. It is built using `build/build.js` and results in a set of `amodro*.js` files in the root of this repo.

Right now `build/build.js` is fairly basic and allows overriding some of the injected pieces via file paths. Longer term it would be nice to allow a command line or optional secondary file config for the options, improve

`build/build.js` injects some files vs just a concatenation to take advantage of some private scope state and reuse of some privately declared functions. This was mostly done for expedience and to help control the size of the generated files, but a more separated build of concatenated overrides should be possible longer term.

`npm test` can be used to run the tests in `test` as well as `test-es`.

To check requirejs test compatibility, clone [amodro-requirejs-tests](https://github.com/amodrojs/amodro-requirejs-tests) as as sibling to this repo to use those modified tests with the loaders generated here.
