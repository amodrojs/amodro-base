/*jshint strict: false */
/*global protoModifiers, amodro */
protoModifiers.push(function (proto) {
  var sourceUrlRegExp = /\/\/@\s+sourceURL=/;

  var oldTranslate = proto.translate;
  proto.translate = function(normalizedId, location, source) {
    var esmResult = esmTranslator.esmAmd(source);

    if (esmResult.translated) {
//todo: tell the loader this is an es module, to handle export adjustments if
//caller or callee is a plain AMD module.
      var result = 'define(function(require, exports, module) { ' +
                    esmResult.source +
                    ' });';

      //Add sourceURL, but only if one is not already there.
      if (!sourceUrlRegExp.test(result)) {
        result += "\r\n//# sourceURL=" + location;
      }

      console.log('TRANSLATE: ' + normalizedId + ': ' + location);
      console.log(result);
      return result;
    }

    return source;
  };

  // Always XHR load, so that translation can occur.
  proto.useScript = function(normalizedId, refId, location) {
    return false;
  };
});
