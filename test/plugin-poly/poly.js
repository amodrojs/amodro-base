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
