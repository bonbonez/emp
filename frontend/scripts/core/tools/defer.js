(function(window, document, BM){

  var tools = BM.tools = BM.tools || {};

  var slice = Array.prototype.slice;

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  var delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  var defer = function(func) {
    return delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  tools.defer = defer;

})(
  this,
  this.document,
  this.BM = this.BM || {}
);