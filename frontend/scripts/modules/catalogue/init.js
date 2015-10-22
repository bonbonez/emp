(function(window, modules, $, BM){

  modules.define(
    'CatalogueInit',
    [
      'extend',
      'baseView',
      'CatalogueMenu',
      'CatalogueItem'
    ],
    function(
      provide,
      extend,
      BaseView,
      CatalogueMenu,
      CatalogueItem
    ) {

      var CatalogueInit = extend(BaseView),

        $class  = CatalogueInit,
        $super  = $class.superclass,

        $window = $(window);

      BM.tools.mixin($class.prototype, {

        initialize : function() {
          $super.initialize.apply(this, arguments);

          if (!this.$elem) {
            return;
          }
          
          this.$menu                = this.$elem.find('@bm-page-catalogue-menu');
          this.$itemsWrapper        = this.$elem.find('@bm-catalogue-items-wrapper');
          this.$itemsGridWrapper    = this.$elem.find('@bm-catalogue-items-grid');
          this.$items               = this.$itemsGridWrapper.find('@bm-catalogue-item');
          this.$itemsSpecialWrapper = this.$elem.find('@bm-catalogue-items-special');
          this.$itemsSpecial        = this.$itemsSpecialWrapper.find('@bm-catalogue-item');

          this._menu  = null;
          this._items = [];

          this._initMenu();
          this._initItems();
          this._updateItems();
          this._bindEvents();

          //this._items[0]._setMoreInfoVisible(true);
          this._items[0]._showPopup();
        },

        _bindEvents : function() {

        },

        _initItems : function() {
          var self = this;
          this.$items.each(function(){
            var instance = new CatalogueItem({
              element: $(this)
            });
            self._items.push(instance);
          });
        },

        _initMenu : function() {
          if (!BM.tools.isNull(this._menu)) {
            return;
          }

          this._menu = new CatalogueMenu({
            element: this.$menu
          });
          this._menu.on('category-selected', function(categoryName, special){
            if (!special) {
              this.el.removeAttr('data-special');
              this.$itemsGridWrapper.attr('data-selected-category', categoryName);
              BM.helper.browser.triggerRerender();
              this._updateItems();

              /*if (BM.tools.client.isTouch()) {
                $.scrollTo(this._menu.el.offset().top, 400);
              }*/
            } else {
              this.el.attr('data-special', special);
            }
          }.bind(this));
        },

        _updateItems : function() {
          if (BM.tools.client.isTouch()) {
            return;
          }

          var self = this;
          this.$items.filter(':visible').each(function(i, el){
            var handler = self._getItemHandler(this);
            if (!BM.tools.isNull(handler)) {
              (i + 1) % 4 === 0 ? handler.dockMoreToRight() : handler.dockMoreToLeft();
            }
          });
        },

        _getItemHandler : function(el) {
          return this._items.filter(function(item){
            return item.el.get(0) === el;
          })[0] || null;
        }

      });

      new CatalogueInit({
        element: $(document.body).find('@bm-page-catalogue')
      });

      provide(CatalogueInit);

    });

}(this, this.modules, this.jQuery, this.BM));