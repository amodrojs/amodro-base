/*jshint strict: false */
/*global protoModifiers, amodro */
protoModifiers.push(function (proto) {
  proto.amodroFetch = function(normalizedId, refId, location) {
    var jsSuffixRegExp = /\.js$/;

    return new Promise(function(resolve, reject) {
      require('fs').readFile(location, 'utf8', function(err, text) {
        // If a JS script, simulate browser evaluation on script load, where
        // the text is not visible to the loader.
        if (this.useScript(normalizedId, refId, location)) {
          amodro.evaluate(text);
          this.execCompleted(normalizedId);
          text = '';
        }

        if (err) {
          reject(err);
        } else {
          resolve(text);
        }
      }.bind(this));
    }.bind(this));
  };
});