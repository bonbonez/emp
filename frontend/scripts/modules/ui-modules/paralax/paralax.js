(function(window, modules, $, BM){

  modules.define('Paralax', ['extend', 'basePubSub'], function(provide, extend, PubSub) {

    var Paralax = extend(PubSub),

        $class = Paralax,
        $super = $class.superclass;

    var getTemplate = function() {
        return $($('#bm-paralax-view-template').html());
      },

      getTemplateItem = function() {
        return $($('#bm-paralax-item-template').html());
      };

    BM.tools.mixin($class.prototype, {

      initialize : function(config) {
        $super.initialize.apply(this, arguments);

        this._speed = 0.5;
        this._steps = [];

        this._applyConfig();
      },

      _applyConfig : function() {
          if (BM.tools.isPresent(config)) {
            if (BM.tools.isPresent(config.speed)) {
              this._speed = config.speed;
            }
            if (BM.tools.isPresent(config.steps)) {
              this._parseSteps(config.steps);
            }
          }
      },

      _parseSteps : function(steps) {
        this._steps.length = 0;
        this._steps = [];

        steps.forEach(function(step) {
          this._steps.push(step);
        }.bind(this));

        this._steps = this._steps.sort(function(x, y) {
            if (x.breakpoint > y.breakpoint) {
              return 1;
            } else if (x.breakpoint < y.breakpoint) {
              return -1;
            } else {
              return 0;
            }
        });
      }

    });

    provide(Paralax);

  });

}(this, this.modules, this.jQuery, this.BM));