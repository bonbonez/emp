(function(window, modules, $, BM){

    modules.define('Event', ['extend', 'baseClass'], function(provide, extend, BaseClass){

        var Event = extend(BaseClass),

            $class = Event,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
              $super.initialize.apply(this, arguments);

              this._data = {};

              if (!BM.tools.isUndefined(config) && !BM.tools.isUndefined(config.data)) {
                this.setData(config.data);
              }
            },

          setData : function(obj) {
              if (BM.tools.isObject(obj)) {
                BM.tools.mixin(this._data, obj);
              }
          },

          getData : function() {
            return this._data();
          }

        });

        provide(Event);
    });

}(this, this.modules, this.jQuery, this.BM));