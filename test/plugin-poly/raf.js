define(function() {
  // Fake requestAnimationFrame with a setTimeout.
  return function raf(fn) {
    setTimeout(fn, 50);
  };
});
