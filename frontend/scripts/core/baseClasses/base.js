(function (window, modules, BM) {

  var baseClassModule = function (provide) {

    var instanceCounter = 0;

    var BaseClass = (function () {
      function BaseClass() {
        // enforces new
        if (!(this instanceof BaseClass)) {
          return new BaseClass(arguments);
        }
        // constructor body

        this.initialize.apply(this, arguments);
      }

      BM.tools.mixin(BaseClass.prototype, {
        initialize : function () {
          this._instanceId       = ++instanceCounter;
          this._registeredEvents = [];
        },
        destroy : function () {

        },
        getInstanceId : function () {
          return this._instanceId;
        },
        _registerEvent : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isInstanceOf(event, BaseClass)) {
              this._pushRegisteredEvent(event);
            }
        },
        _isEventRegistered : function(event) {
            return this._registeredEvents.indexOf(event.getInstanceId()) !== -1;
        },
        _pushRegisteredEvent : function(event) {
          if (!this._isEventRegistered(event)) {
            this._registeredEvents.push(event.getInstanceId());
          }
        }
      });

      return BaseClass;

    }());

    provide(BaseClass);
  };

  modules.define(
    'baseClass',        // Module name
    [],                 // Dependies
    baseClassModule     // Module realization
  );

}(this, this.modules, this.BM));