(function(window, modules, $, BM){

  modules.define(
    'CatalogueMenu',
    [
      'extend',
      'baseView',
      'EventDispatcher'
    ],
    function(
      provide,
      extend,
      BaseView,
      EventDispatcher
      ) {

    var CatalogueMenu = extend(BaseView),

        $class        = CatalogueMenu,
        $super        = $class.superclass,

        $window       = $(window);

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this.$elemsItems = this.$elem.find('@bm-catalogue-menu-item');
        this._offsetTop  = this.$elem.offset().top;

        this._bindEvents();
      },

      _bindEvents : function() {
        EventDispatcher.on('window-scroll', function() {
          this._updatePosition();
        }.bind(this));
      },

      _updatePosition : function() {
        if ($window.scrollTop() >= this._offsetTop) {
          this.$elem.addClass('m-fixed');
        } else {
          this.$elem.removeClass('m-fixed');
        }
      },

      focusItem : function(itemName) {
        var item = this.$elemsItems.filter('[data-item=' + itemName + ']');
        if (item.length > 0) {
          this.$elemsItems.removeClass('m-focused');
          item.addClass('m-focused');
        }
      }

    });

    provide(CatalogueMenu);

  });

}(this, this.modules, this.jQuery, this.BM));