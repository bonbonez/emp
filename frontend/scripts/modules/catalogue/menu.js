(function(window, modules, $, BM){

  modules.define(
    'CatalogueMenu',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

      var CatalogueMenu = extend(BaseView),

        $class  = CatalogueMenu,
        $super  = $class.superclass,

        $window = $(window);

      BM.tools.mixin($class.prototype, {

        initialize : function() {
          $super.initialize.apply(this, arguments);

          if (!this.el) {
            return;
          }

          this.$items = this.$elem.find('@bm-page-catalogue-menu-item');

          this._bindEvents();
        },

        _bindEvents : function() {
          this.$items.on(BM.helper.event.clickName(), function(event){
            this._onItemClick(event);
          }.bind(this));
        },

        _onItemClick : function(event) {
          var $item = $(event.target),
              name  = $item.data('name');

          if (BM.tools.isNull($item.data('name'))) {
            $item = $item.parent('.bm-page-catalogue-menu-item');
            name  = $item.name;
          }

          this.$items.removeClass('m-selected');
          $item.addClass('m-selected');
          this._notify('category-selected', $item.data('name'), $item.data('special'));
        }

      });

      provide(CatalogueMenu);

    });

}(this, this.modules, this.jQuery, this.BM));