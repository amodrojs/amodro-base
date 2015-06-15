* plugin-delegated not working, wants to do delgated!r!a where r is aliased to refine. So, nested loader plugin use. Can this work? See also requirejs plugins/pluginNormalize/pluginNormalize.html.

## plugins:

* test loading a plugin that had a depending on the module wanting to use it in a dependency.
* alias config of 'c' asking for 'a' aliased to 'plugin!', but 'c' having a cycle with 'plugin!'.
* test text!something.js loading of the text, not executing it.
  Do not think the cycle can be broken in that case.
* how to support config? like isBuild? Is it needed?


## Difference with requirejs:

* plugin API is different.
* no requirejs.onError, use local promise error handling.
* the errback errors are structured differently.
* no direct URL loading support.

# requirejs adapter

* scrub the other config options, like waitSeconds
