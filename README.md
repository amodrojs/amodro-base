# amodro-base

Wraps amodro-lifecycle with a baseline AMD loader implementation. Optional extensions to the baseline are supported too.

The goals of this project:

* Prove out amodro-lifecycle as a reusable module loader core. See [amodrojs/node-es-adapt](https://github.com/amodrojs/node-es-adapt) for a different wrapping of amodro-lifecycle, focused on node and traditional node module interop with ES2015 modules.
* Provide a future looking AMD loader, with a more customized base that allows bridging more module formats during this transition period. Could be useful for transpiled code that want to use AMD as the module runtime substrate.
* A possible requirejs replacement, what a requirejs 3 might look like, with a more modern underpinning and the ability to break some compatibility in the interests of better APIs, particularly around loader plugins and disallowing URLs as module IDs.

## Documentation

* [Code structure](https://github.com/amodrojs/amodro-base/blob/master/docs/structure.md)
* [API](https://github.com/amodrojs/amodro-base/blob/master/docs/api.md)
* [Loader plugin API](https://github.com/amodrojs/amodro-base/blob/master/docs/loader-plugin-api.md)

## Loader variants

* amodro: AMD loader, workers in browser documents and workers. Only works in browsers with native Promise support. Uses browser script tags for JS scripts, XHR calls for loader plugin fetches.
* amodro-prim: Same as `amodro` but includes a promise shim. The shim is only activated at runtime if the browser does not natively support Promises.
* amodro-es: Like amodro, but always uses XHR and eval instead of script tags so that it can translate ES2015 module syntax into AMD module syntax. Requires native promise support in the browser. Allows trying out ES2015 module syntax without needing to do builds. ES module translation limited to what [esm-es5](https://github.com/jrburke/esm-es5) can do.
* amodro-requirejs: amodro, with a compatibility layer for requirejs users. Requires browsers with native Promise support.
* amodro-requirejs-prim: amodro-requirejs, but with a Promise shim that is only activated at runtime if the browser does not natively support Promises.

Eventually separate repos/package bundles will be generated for each variant, but for now you can generate them by cloning this repo and running `node build/build.js`. The result is a set of `amodro*.js` files in the root of this repo.

## Prerequisites

1) Modern web browsers that support ECMAScript 5. Unfortunately IE support only goes back to IE 10 due to a [script onload bug in IE 9](https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution).

It is likely possible to support IE 9, but a different loader variant would need to be made, porting the attachEvent/interactive readyState approach used in requirejs.

2) Currently there is no build tool support for these amodro variants. Since they use a different global API than requirejs and the loader plugin API is different, the [r.js optimizer](http://requirejs.org/docs/optimization.html) cannot be used to trace dependencies.

On the plus side, the extensible layering of optional functionality via the lifecycle steps means it will be easier to make build tools on this foundation, and the loader plugin API for transpilers is much, much simpler. Build tool support is the next step up for this project.

## Other AMD loader options

These other AMD loader might be a better fit for you if:

1) Your project does not meet the browser threshold in [Prerequisites](#prerequisites). Try [requirejs](https://github.com/jrburke/requirejs) instead.

2) Only need IE 10+ and modern browsers, but do not need the flexible lifecycle steps and overrides in this project and prefer a slightly smaller loader? Try [alameda](https://github.com/requirejs/alameda) instead. It even has a [native-promise branch](https://github.com/requirejs/alameda/tree/native-promise) for projects that can rely on native promise support in the browser.

Either one of those loaders can use the [r.js optimizer](http://requirejs.org/docs/optimization.html) for build situations.

