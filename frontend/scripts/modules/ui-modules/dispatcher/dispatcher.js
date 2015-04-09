(function(window, modules, $, BM){

  var dispatcherInstance = null;

  modules.define('EventDispatcherConstructor', ['extend', 'basePubSub'], function(provide, extend, PubSub) {

    var EventDispatcher = extend(PubSub),

        $class = EventDispatcher,
        $super = $class.superclass,

        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        this._timeoutNotifyResize = null;

        this._bindEvents();
      },

      _bindEvents : function() {
        $window.one('resize',function onWindowResize() {
          if (!BM.tools.isNull(this._timeoutNotifyResize)) {
            clearTimeout(this._timeoutNotifyResize);
            this._timeoutNotifyResize = null;
          }

          this._timeoutNotifyResize = setTimeout(function() {
            this._notify('window-resize');
          }.bind(this), 200);

          setTimeout(function() {
            $window.one('resize', onWindowResize.bind(this))
          }.bind(this), 50);
        }.bind(this));

        $window.one('scroll', function onWindowScroll() {
          this._notify('window-scroll');
          setTimeout(function() {
            $window.one('scroll', onWindowScroll.bind(this));
          }.bind(this), 25)
        }.bind(this));
      }

    });

    provide(EventDispatcher);

  });

  modules.define('InitEventDispatcher', ['EventDispatcherConstructor'], function(provide, Dispatcher) {
    dispatcherInstance = new Dispatcher();
    provide();
  });

  modules.define('EventDispatcher', [], function(provide) {
    provide(dispatcherInstance);
  });

}(this, this.modules, this.jQuery, this.BM));