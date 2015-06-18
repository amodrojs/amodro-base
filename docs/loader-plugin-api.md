# Loader plugin API

**Preliminary docs, still in progress**

With the use of [amodro-lifecycle](https://github.com/amodrojs/amodro-lifecycle), the style of the API is to match the lifecycle steps. There are some special considerations for transpiler plugins so they just need to provide a `translate` step.

Loader plugins are regular modules that implement an API that will be used for the resource IDs tied to that loader plugin ID. Example loader plugin dependency:

    text!templates/list.html

`text` is the loader plugin ID (pluginId), `templates/list.html` is the resource ID or (resourceId).

The loader plugin API is the [lifcycle step API](https://github.com/amodrojs/amodro-lifecycle#lifecycle-steps), but a proxy to the loader instance is passed as the first argument, with the standard lifecycle arguments following it. Since loader plugins commonly need to know their module ID assigned at runtime, asking for the [special AMD dependency](https://github.com/jrburke/requirejs/wiki/Differences-between-the-simplified-CommonJS-wrapper-and-standard-AMD-define#magic) `module` can be useful.

Example starting template for a loader plugin that wants to just modify the `fetch` lifecycle step for resourceIds related to it:

```javascript
define(function(require) {
  var module = require('module');

  return {
    fetch: function (loader, resourceId, refId, location) {
    }
  };
});

```

Here is a fuller example of a "polyfill" loader plugin that given a test name will test for a browser capability and either set the module export to that capability or load an adapter script to provide a polyfill for it. In this example, just one test, 'raf', is shown, to test for requestAnimationFrame:

```javascript
define(['module'], function(module) {
  var testIds = {
    raf: {
      test: function() {
        return typeof requestAnimationFrame !== 'undefined';
      },
      getValue: function() {
        return requestAnimationFrame;
      }
    }
  };

  return {
    fetch: function (loader, resourceId, refId, location) {
      var testEntry = testIds[resourceId];
      if (testEntry.test()) {
        loader.setModule(module.id + '!' + resourceId, testEntry.getValue());
      } else {
        return loader.use(resourceId, module.id + '!' + resourceId)
        .then(function(moduleValue) {
          loader.setModule(module.id + '!' + resourceId, moduleValue);
        });
      }
    }
  };
});
```

This could be used like so:

```javascript
amodro(['poly!raf'], function(raf) {});
```

### Transpiler plugins

Transpiler plugins are fairly common ones to want to use in a module system. They really just want to load the modules as usual but translate the source into an AMD module written in JavaScript.

Since those transpilers often deal with non `.js` files, amodro provides a couple of extra APIs to express that, then just leave the plugin to implement the `translate` lifecycle step.

### locateExtension

This allows specifying the suggested file extension for `locate` lifecycle step calls, if the module needs to be located as a separate file (vs in a bundle of modules or in a data: URL). This is best for transpiler plugins that just deal with one language, for example a CoffeeScript plugin, where it wants to handle `.cs` files:

```javascript
define(function (require) {
  // require('') a coffeescript compiler here.

  return {
    locateExtension: 'cs',
    translate: function(loader, normalizedId, location, source) {
      // Convert source to an AMD define() JavaScript module, and
      // return that transpiled source.
      return source;
    }
  };
});
```

Assuming this module is available at the module ID `cs`, then it can be used like so:

```javascript
// This results in app.cs loaded and translated to JS source.
amodro(['cs!app'], function(app) {});
```

### locateDetectExtension

There are some extensions that want to handle multiple extension types. The most common example of this is a `text!` loader plugin. In that case, setting `locateDetectExtension` to true will result in amodro detecting the extension in the `locate` step to properly load the file, so that the loader plugin just has to worry about translating the source.

Example text plugin:

```javascript
define(function () {
  function jsEscape(content) {
    return content.replace(/(['\\])/g, '\\$1')
      .replace(/[\f]/g, '\\f')
      .replace(/[\b]/g, '\\b')
      .replace(/[\n]/g, '\\n')
      .replace(/[\t]/g, '\\t')
      .replace(/[\r]/g, '\\r')
      .replace(/[\u2028]/g, '\\u2028')
      .replace(/[\u2029]/g, '\\u2029');
  }

  return {
    locateDetectExtension: true,

    translate: function(loader, normalizedId, location, source) {
      source = 'define(function() {\n' +
               'return \'' + jsEscape(source) + '\';\n' +
               '});';

      //Add in helpful debug line
      source += '\r\n//@ sourceURL=' + location;
      return source;
    }
  };
});
```

Assuming this module is available at the module ID `text`, then it can be used like so:

```javascript
amodro(['text!app.html', 'text!app.css`], function(appHtml, appCss) {});
```
