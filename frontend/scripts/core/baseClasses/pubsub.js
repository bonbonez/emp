(function(window, modules, BM, $){

  modules.define('basePubSub', ['baseClass', 'extend'], function(provide, baseClass, extend){

    var PubSub = extend(baseClass),

        $class = PubSub,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        this._events   = [];
        this._sniffers = [];

        $super.initialize.apply(this, arguments);
      },

      _notify : function(event) {
        if (!this._eventExists(event)) {
          if (this._sniffers.length > 0) {
            this._notifySniffers(event, Array.prototype.slice.call(arguments, 1));
          }
          return;
        }
        var me      = this,
            args    = Array.prototype.slice.call(arguments, 1),
            events  = this._getEventObject(event),
            removed = false;

        events.forEach(function(event){
          if (args.length > 0) {
            event.callback.apply(event.context, args);
          } else {
            event.callback.call(event.context);
          }

          if (BM.tools.isNumber(event.times)) {
            event.times -= 1;
            if (event.times <= 0) {
              me.off(event.event, event.callback, event.context);
              removed = true;
            }
          }
        });

        if (!removed) {
          this._notifySniffers(event, args);
        }
      },

      _notifySniffers : function(event, args) {
        this._sniffers.forEach(function(sniffer){
          var events = sniffer._getEventObject(event);
          events.forEach(function(event){
            if (BM.tools.isNumber(event.times)) {
              return;
            }

            if (args.length > 0) {
              event.callback.apply(null, args);
            } else {
              event.callback.call(null);
            }
          });
        });
      },

      on : function(event, callback, context) {
        if (!BM.tools.isPresent(event) && !BM.tools.isPresent(callback)) {
          return;
        }

        if (BM.tools.isArray(event)) {
          event.forEach(function(eventName) {
            this._pushEvent(eventName, callback, context);
          }.bind(this));
        } else if (BM.tools.isString(event)) {
          if (event.indexOf(' ') !== -1) {
            event = event.split(' ');
            event.forEach(function(eventName) {
              this._pushEvent(eventName, callback, context);
            }.bind(this));
          } else {
            this._pushEvent(event, callback, context);
          }
        }
      },

      _pushEvent : function(event, callback, context) {
        this._events.push({
          event: event,
          callback: callback,
          context: context
        });
      },

      once : function(event, callback, context) {
        if (event === undefined || callback === undefined) {
          return;
        }

        this._events.push({
          event: event,
          callback: callback,
          context: context,
          times: 1
        });
      },

      off : function(event, callback, context) {
        if (arguments.length === 0) {
          this._events.length = 0;
          this._events = [];
          return;
        }

        if (!this._eventExists(event)) {
          return;
        }

        var i, l = this._events.length,
            eventObject;
        for (i = 0; i < l; ++i) {
          eventObject = this._events[i];

          if (!BM.tools.isUndefined(callback) && !BM.tools.isUndefined(context)) {
            if (eventObject.event === event && eventObject.callback === callback && eventObject.context === context) {
              this._events.splice(i, 1);
              return;
            }
          } else if (!BM.tools.isUndefined(callback) && BM.tools.isUndefined(context)) {
            if (eventObject.event === event && eventObject.callback === callback) {
              this._events.splice(i, 1);
              return;
            }
          } else if (!BM.tools.isUndefined(event)) {
            if (eventObject.event === event) {
              this._events.splice(i, 1);
              return;
              }
          }
        }
      },

      sniff : function(pubSubInstance) {
        if (!BM.tools.isUndefined(pubSubInstance) && (pubSubInstance instanceof PubSub)) {
          pubSubInstance.addSniffer(this);
        }
      },

      unsniff : function(pubSubInstance) {
        if (!BM.tools.isUndefined(pubSubInstance) && (pubSubInstance instanceof PubSub)) {
          pubSubInstance.removeSniffer(this);
        }
      },

      addSniffer : function(sniffer) {
        if (!this._snifferExists(sniffer) && sniffer !== this) {
          this._sniffers.push(sniffer);
        }
      },

      removeSniffer : function(sniffer) {
        var i, l = this._sniffers.length;
        for (i = 0; i < l; ++i) {
          if (this._sniffers[i] === sniffer) {
            this._sniffers.splice(i, 1);
            break;
          }
        }
      },

      _snifferExists : function(pubSubInstance) {
        var i, l = this._sniffers.length;
        for (i = 0; i < l; ++i) {
          if (this._sniffers[i] === pubSubInstance) {
            return true;
          }
        }
        return false;
      },

      destroy : function() {
        var me = this;
        this._events.length = 0;
        this._events = null;
        this._sniffers.forEach(function(sniffer){
            me.unsniff(sniffer);
        });
        this._sniffers.length = 0;
        this._sniffers = null;

        $super.destroy.apply(this, arguments);
      },

      _getEventObject : function(event) {
        var i, l = this._events.length,
            events = [];
        for (i = 0; i < l; ++i) {
          if (this._events[i].event === event) {
            events.push(this._events[i]);
          }
        }
        return events;
      },

      _eventExists : function(event) {
        var i, l = this._events.length;
        for (i = 0; i < l; ++i) {
          if (this._events[i].event === event) {
            return true;
          }
        }
        return false;
        }

    });

    provide(PubSub);

  });

}(this, this.modules, this.BM, this.jQuery));