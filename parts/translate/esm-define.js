/*jshint strict: false */
/*global protoModifiers, amodro */
protoModifiers.push(function (proto) {
  var sourceUrlRegExp = /\/\/@\s+sourceURL=/;

  var oldTranslate = proto.translate;
  proto.translate = function(normalizedId, location, source) {
    var result = source,
        esmResult = esmTranslator.esmEs5(source);

    if (esmResult.translated) {
      result = 'define(function(require, exports, module) { ' +
               esmResult.source +
               ' }); (define.es && define.es(\'' + normalizedId + '\'));';
    }

    //Add sourceURL, but only if one is not already there.
    if (!sourceUrlRegExp.test(result)) {
      result += "\r\n//# sourceURL=" + location;
    }

    // console.log('TRANSLATE: ' + normalizedId + ': ' + location);
    // console.log(result);
    return result;
  };

  // Always XHR load, so that translation can occur.
  proto.useScript = function(normalizedId, refId, location) {
    return false;
  };
});
