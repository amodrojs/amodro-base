# API

**Preliminary docs, still in progress**

Include the script in your project. Either use a script tag or if in node, require the amodro-node module. Generate the loaders by running `build/build.js`. The goal is to later create separate repos/package deliverables for each loader variant.

## Relation to requirejs

The outside API is roughly equivalent to the requirejs AMD loader, but with these differences:

* No direct loading of URLs. Always use module IDs and use loader config to point module IDs to paths or URLs. In the normal, suggested project layout, all the modules should be installed under baseUrl such that no config is needed.

* The loader plugin API is different.
* There is no global error handler like `requirejs.onError`, use local promise error handling.
* The errback errors are structured differently.
* The config is slightly different: namely `locations` replaces both `paths` and `packages` config. `map` is known as `alias`. Not all the requirejs config is supported.

One of the generated loader variants includes a requirejs adapter layer that helps replicate more of the requirejs APIs, except for direct URL loading and the error handling. The adapter layer also means most loader plugins should work too.

AMD module definitions have stayed the same, so your define()'d modules should still work as before, just with the caveats around direct URLs in dependency IDs and a loader plugin behind a loader plugin ID might want to implement the new loader plugin API.

## Top level loading

To kick off module loading, just use `amdodro`. It returns a promise too:

```javascript
amodro(['a', 'b'], function(a, b) {
  // a is the module value for 'a'
  // b is the module value for b
}, function(error) {
  // Error handler. As with a normal then promise listener,
  // does not catch errors thrown in the
  // function(a, b){} argument. Use .catch on the returned
  // promise to catch those errors.
}).then(function(deps) {
  // deps[0] is the module for 'a'.
  // deps[1] is the module for 'b'.
}).catch(function(error) {
  // Catches any errors from any part of the preceding
  // then chain.
});
```

## Config

Configuring the loader is done via `amodro.config`:

```javascript
amodro.config({
  baseUrl: 'lib',
  locations: {
    app: '../app'
  }
});
```

Supported config:

### baseUrl

Sets the path to the root for module loading. Relative paths are relative to the document's URL in the browser, and the current working directory in node.

### locations

Sets the URLs/paths to files, as well as specifying if a module ID prefix is a package that contains a "main" module inside of it. Replaces the `paths` and `packages` config as used in requirejs.

The general format for a "locations" config entry: the < > parts indicate logical names for parts that may show up. Three types of ID-segment specifiers can be used

    <id-segment> : <urlpath-segment> - Matches id-segment and id-segment/sub, unless second form is set
    <id-segment>/ : <urlpath-segment> - Matches only id-segment/sub IDs
    <id-segment>{main-sub-id} : <urlpath-segment> - package config

Passing a a value that is `null` or `false`, will be the way to clear a locations entry from a loader, in the case of a reset.

Location values can be relative paths, and in those cases, they are relative to the baseUrl. For package config, if the package can be found at the baseUrl, then an empty string can be used for the locations value.

Examples:

```javascript
amodro.config({
  locations: {
    // Basic module ID prefix setup
    'crypto': 'vendor/crypto',

    // Only a submodule ID under 'db' gets a remote URL
    'db/remote': '//example.com/services/db/remote',

    // jQuery from vendor, plugins from another area
    'jquery': 'vendor/jquery',
    'jquery/': 'plugins/jquery',

    // A "package" setup
    'lodash{main}': 'vendor/lodash'
  }
});

// Basic module ID prefix setup
amodro.locate('crypto', 'js') // 'vendor/crypto.js'
amodro.locate('crypto/aes', 'js') // 'vendor/crypto/aes.js'

// Only a submodule ID under 'db' gets a remote URL
amodro.locate('db', 'js') // 'db.js'
amodro.locate('db/remote', 'js') // '//example.com/services/db/remote.js'

// jQuery from vendor, plugins from another area
amodro.locate('jquery', 'js') // 'vendor/jquery.js'
amodro.locate('jquery/jquery.scroll', 'js') // 'plugins/jquery/jquery.scroll.js'

// A "package" setup
amodro.locate('lodash', 'js') // 'vendor/lodash/main.js'
amodro.locate('jquery/each', 'js') // 'plugins/lodash/each.js'
```

**Notes on package config**:

The special configuration is needed for packages that have a main config to allow modules inside the package to reference on the main module via a relative ID.

In the above example, if 'lodash/filter' wanted to use something in 'lodash/main', it should just be able to use `require('./main')` to access it. With a plain `locations` config, it would result in two module entries, one for 'lodash' and 'lodash/main', which would be separate module instances of the same module, an undesirable and confusing result.

The "main" value, specified in the `{}` part of the property hame, should not include a file extension, like '.js'. It is actually a module ID segment that is based on the directory name. So, in the above example, if the main module was actually at 'vendor/lodash/lib/main.js', then the 'main' value would be 'lib/main'.

### alias

Specifies for a given module ID prefix, what module ID prefix to use in place of another module ID prefix. For example, how to express "when 'bar' asks for module ID 'foo', actually use module ID 'foo1.2'".

This sort of capability is important for larger projects which may have two sets of modules that need to use two different versions of 'foo', but they still need to cooperate with each other.

This is different from `locations` config. `locations` is only for setting up root paths for module IDs, not for aliasing one module ID to another one.

```javascript
{
  alias: {
    'some/newmodule': {
      'foo': 'foo1.2'
    },
    'some/oldmodule': {
      'foo': 'foo1.0'
    }
  }
}
```

If the modules are laid out on disk like this:

* foo1.0.js
* foo1.2.js
* some/
    * newmodule.js
    * oldmodule.js

When 'some/newmodule' asks for 'foo' it will get the 'foo1.2' module from foo1.2.js, and when 'some/oldmodule' asks for 'foo' it will get the 'foo1.0' module from foo1.0.js file.

This feature only works well for scripts that are real AMD modules that call define() and register as anonymous modules. If named modules are being used, it will not work.

Any module ID prefix can be used for the alias properties, and the aliases can point to any other module ID prefix. The more specific module ID prefixes are chosen when resolving which alias value to use.

Example:

```javascript
amodro.config({
  alias: {
    'some/newmodule': {
      'foo': 'foo2',
      'foo/bar': 'foo1.2/bar3'
    },
    'some/oldmodule': {
      'foo/bar/baz': 'foo1.0/bar/baz2'
    }
  }
});
```

If 'some/module/sub' asks for 'foo' it gets 'foo2'. If 'some/module/sub' asks for 'foo/bar' it gets 'foo1.2/bar3'.

There is a "*" alias value which means "for all modules loaded, use this alias config". If there is a more specific alias config, that one will take precedence over the star config.

Example:

```javascript
amodro.config({
  alias: {
    '*': {
      'foo': 'foo1.2'
    },
    'some/oldmodule': {
      'foo': 'foo1.0'
    }
  }
});
```

In this example if 'some/oldmodule' asks for 'foo', it will get 'foo1.0', where if any other module who asks for 'foo' will get 'foo1.2'.

## after

Get called after a specific [lifecycle step](https://github.com/amodrojs/amodro-lifecycle#lifecycle-steps) has occurred, with the option to change the result value. Config keys are the lifecycle keys.

An example that wants to modify the return value of `locate` to add a cache busting argument:

```javascript
amodro.config({
  after: {
    locate: function(result, normalizedId, suggestedExtension) {
      return result + '?cachebust=' + Date.now();
    }
  }
});
```

## Multiple loader instances

To create a new loader which does not share the loaded modules with the default module, `amodro`:

```javascript
var load = amodro.createLoader({
  // You can pass initial config here.
});

// Pass more config later.
load.config({});

// Start loading modules.
load(['a', 'b'], functino(a, b) {});
```
