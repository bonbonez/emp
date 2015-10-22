(function(window, modules, $, BM){

  modules.define(
    'Model',
    [
      'extend',
      'basePubSub'
    ],
    function(
      provide,
      extend,
      PubSub
    ) {

    var Model = extend(PubSub),

        $class = Model,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.apply(this, arguments);

        this._data = {};

        if (config && config.data) {
          this._data = BM.tools.mixin(this._data, config.data);
        }

      },

      setData : function(data) {
        BM.tools.mixin(this._data, data);
      },

      getData : function() {
        return this._data;
      }

    });

    provide(Model);

  });

}(this, this.modules, this.jQuery, this.BM));