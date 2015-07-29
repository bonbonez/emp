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
          
          this.$list        = this.$elem.find('@bm-page-catalogue-list');
          this.$select      = this.$elem.find('@bm-page-catalogue-select');
          this.$listItems   = this.$list.find('@bm-page-catalogue-menu-item');
          this.$selectItems = this.$select.find('@bm-page-catalogue-menu-select-item');
          //this.$selectItems = this.$select.find('@bm-page-catalogue-menu-item');

          this.$selectDropdownButton     = this.el.find('@bm-page-catalogue-menu-select-dropdown-button');
          this.$selectCurrentItemWrapper = this.el.find('@bm-page-catalogue-menu-select-current-item-wrapper');

          this._offset = null;
          this._selectItemHeight = null;

          this._updateSelect();
          this._bindEvents();
        },

        _bindEvents : function() {
          var self      = this,
              clickName = BM.helper.event.clickName();

          this.$selectItems.on(clickName, function(event) {
            self._onSelectItemClick(event, this);
          });
          this.$listItems.on(clickName, function(event) {
            this._onListItemClick(event);
          }.bind(this));

        },

        _updateSelect : function() {
          this._updateMenuOffset();
          this._updateSelectItemHeight();
          //this._updateSelectItemWrapper();

          this._updateItemsPosition();
        },

        _updateItemsPosition : function() {
          var self = this;
          this.$selectItems.each(function(i, el){
            if (i < 1) {
              return;
            }

            var $item = $(this);console.log();
            $item.css({
              'transform' : 'translateY(' + self._selectItemHeight * i + 'px)'
            });
          });
        },

        _updateMenuOffset : function() {
          if (!BM.tools.isNull(this._offset)) {
            this._updateMenuOffset = function(){};
            return;
          }
          this._offset = this.el.offset();
        },

        _updateSelectItemHeight : function() {
          if (!BM.tools.isNull(this._selectItemHeight)) {
            this._updateSelectItemHeight = function(){};
            return;
          }
          this._selectItemHeight = this._getSelectedSelectItem().height();
        },

        _getSelectedSelectItem : function() {
          return this.$selectItems.filter(function(){
            return $(this).hasClass('m-selected');
          });
        },

        _updateSelectItemWrapper : function() {
          this.$selectItems.each(function(){
            var $this = $(this),
                $item = $this.find('@bm-page-catalogue-menu-item');
            if ($item.hasClass('m-selected')) {
              $this.addClass('m-selected');
            } else {
              $this.removeClass('m-selected');
            }
          });
        },

        _onSelectItemClick : function(event, $item) {
          $item = $($item);
          if ($item.hasClass('m-selected')) {
            this._toggleMenu();
          } else {
            this.$selectItems.removeClass('m-selected');
            $item.addClass('m-selected');
            this._toggleMenu();
          }

          var $menuItem = $item.find('@bm-page-catalogue-menu-item');
          this._notify('category-selected', $menuItem.data('name'), $menuItem.data('special'));
        },

        _toggleMenu : function() {
          if (this._isSelectExpanded()) {
            this._collapseSelect();
          } else {
            this._expandSelect();
          }
        },

        _isSelectExpanded : function() {
          return this.el.hasClass('m-select-expanded')
        },

        _expandSelect : function() {
          this.el.addClass('m-select-expanded');
        },

        _collapseSelect : function() {
          this.el.removeClass('m-select-expanded');
        },

        _onListItemClick : function(event) {
          var $item = $(event.target),
              name  = $item.data('name');

          if (BM.tools.isNull($item.data('name'))) {
            $item = $item.parent('.bm-page-catalogue-menu-item');
            name  = $item.name;
          }

          this.$listItems.removeClass('m-selected');
          $item.addClass('m-selected');
          this._notify('category-selected', $item.data('name'), $item.data('special'));
        }

      });

      provide(CatalogueMenu);

    });

}(this, this.modules, this.jQuery, this.BM));