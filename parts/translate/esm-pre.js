var esmTranslator = {};

(function() {
  // Hide module system from interior code to that the modules attach
  // properties to "this", which is esmTranslator.
  var require, exports, module, define;