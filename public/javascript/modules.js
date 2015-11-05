'use strict';

(function (window, modules, $, radio) {

    modules.define('pageCartInit', ['pageCartItem', 'CartProcessor'], function (provide, CartItem, cart) {

        var $elemPageCart = $('@b-page-cart');

        $('@b-cart-item').each(function () {
            var $this = $(this);
            new CartItem({ element: $this });
        });

        cart.on('update', function () {
            if (cart.getTotalItems() < 1) {
                $elemPageCart.attr('data-cart-empty', 'true');
            }
        });

        provide();
    });
})(undefined, undefined.modules, undefined.jQuery, undefined.radio);
'use strict';

(function (window, modules, $) {

    modules.define('pageCartItem', ['basePubSub', 'extend'], function (provide, PubSub, extend) {

        var CartItem = extend(PubSub),
            $class = CartItem,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize: function initialize(config) {
                $super.initialize.apply(this, arguments);

                this.$elem = config.element;
                this.$elemButtonRemove = this.$elem.find('@b-cart-item-button-remove');
                this.$elemButtonMinus = this.$elem.find('@b-cart-item-button-minus');
                this.$elemButtonPlus = this.$elem.find('@b-cart-item-button-plus');
                this.$elemAmount = this.$elem.find('@b-cart-item-amount');
                this.$elemPrice = this.$elem.find('@b-cart-item-price');
                this.$elemPriceTotal = this.$elem.find('@b-cart-item-price-total');

                this._config = {
                    item: {
                        id: null
                    }
                };

                this._parseConfig();
                this._updateLayout();
                this._setupEvents();
            },

            _parseConfig: function _parseConfig() {
                try {
                    this._config = JSON.parse(this.$elem.attr('data-config'));
                } catch (e) {}
            },

            _setupEvents: function _setupEvents() {
                var me = this;
                this.$elemButtonRemove.on('click', function () {
                    me._onButtonCloseClick();
                });
                this.$elemButtonMinus.on('click', function () {
                    me._onButtonMinusClick();
                });
                this.$elemButtonPlus.on('click', function () {
                    me._onButtonPlusClick();
                });
            },

            _onButtonCloseClick: function _onButtonCloseClick() {
                //this.hide();
                //this._setStateWait(true);
                var me = this;
                this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/remove',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success: function success(data) {
                        setTimeout(function () {
                            me._onRequestItemRemoveSuccess(data);
                        }, 300);
                    },
                    error: function error() {
                        setTimeout(function () {
                            me._onRequestAddToCartError();
                        }, 300);
                    }
                });
            },

            _onButtonMinusClick: function _onButtonMinusClick() {
                if (this._getCurrentAmount() > 1) {
                    this._sendRequestDecItem();
                }
            },

            _sendRequestDecItem: function _sendRequestDecItem() {
                var me = this;
                //this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/dec',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success: function success(data) {
                        setTimeout(function () {
                            me._onRequestDecItemSuccess();
                            radio('b-cart-update').broadcast(data);
                        }, 300);
                    },
                    error: function error() {
                        me._onRequestDecItemError();
                    }
                });
            },

            _onRequestDecItemSuccess: function _onRequestDecItemSuccess() {
                this._setStateWait(false);
                this._decItemAmount();
                this._updatePrice();
            },

            _onRequestDecItemError: function _onRequestDecItemError() {
                this._setStateWait(false);
            },

            _onButtonPlusClick: function _onButtonPlusClick() {
                this._sendRequestIncItem();
            },

            _sendRequestIncItem: function _sendRequestIncItem() {
                var me = this;
                //this._setStateWait(true);
                $.ajax({
                    url: '/api/cart/item/inc',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        item: {
                            id: this._config.item.id
                        }
                    },
                    success: function success(data) {
                        setTimeout(function () {
                            me._onRequestIncItemSuccess(data);
                        }, 300);
                    },
                    error: function error() {
                        me._onRequestIncItemError();
                    }
                });
            },

            _onRequestIncItemSuccess: function _onRequestIncItemSuccess(data) {
                this._setStateWait(false);
                this._incItemAmount();
                this._updatePrice();
                radio('b-cart-update').broadcast(data);
            },

            _onRequestIncItemError: function _onRequestIncItemError() {
                this._setStateWait(false);
            },

            _onRequestItemRemoveSuccess: function _onRequestItemRemoveSuccess(data) {
                var me = this;
                setTimeout((function () {
                    me.hide();
                    radio('b-cart-update').broadcast(data);
                }).bind(this), 300);
            },

            _onRequestItemRemoveError: function _onRequestItemRemoveError() {
                setTimeout((function () {
                    this._setStateWait(false);
                }).bind(this), 300);
            },

            _slideOut: function _slideOut(callback) {},

            hide: function hide() {
                this.$elem.attr('data-visible', 'false');
            },

            _updateLayout: function _updateLayout() {},

            _setStateWait: function _setStateWait(bool) {
                if (bool) {
                    this.$elem.attr('data-wait', 'true');
                } else {
                    this.$elem.attr('data-wait', 'fasle');
                }
            },

            _getCurrentAmount: function _getCurrentAmount() {
                var amount = this.$elemAmount.html();
                amount = parseInt(amount, 10);
                return amount;
            },

            _incItemAmount: function _incItemAmount() {
                var amount = this._getCurrentAmount();
                this._showButtonMinus();
                return this.$elemAmount.html(amount + 1);
            },

            _decItemAmount: function _decItemAmount() {
                var amount = this._getCurrentAmount();
                if (amount <= 2) {
                    this._hideButtonMinus();
                }
                return this.$elemAmount.html(amount - 1);
            },

            _showButtonMinus: function _showButtonMinus() {
                this.$elemButtonMinus.attr('data-visible', 'true');
            },

            _hideButtonMinus: function _hideButtonMinus() {
                this.$elemButtonMinus.attr('data-visible', 'false');
            },

            _updatePrice: function _updatePrice() {
                var amount = this._getCurrentAmount();
                if (amount > 1) {
                    this._showPriceTotal();
                } else {
                    this._hidePriceTotal();
                }
            },

            _showPriceTotal: function _showPriceTotal() {
                this.$elemPriceTotal.html(this._getCurrentAmount() * this._config.item.price);
                this.$elemPrice.attr('data-total-visible', 'true');
            },

            _hidePriceTotal: function _hidePriceTotal() {
                this.$elemPrice.attr('data-total-visible', 'false');
            },

            destroy: function destroy() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(CartItem);
    });
})(undefined, undefined.modules, undefined.jQuery);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueInit', ['extend', 'baseView', 'CatalogueMenu', 'CatalogueItem'], function (provide, extend, BaseView, CatalogueMenu, CatalogueItem) {

    var CatalogueInit = extend(BaseView),
        $class = CatalogueInit,
        $super = $class.superclass,
        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this.$menu = this.$elem.find('@bm-page-catalogue-menu');
        this.$itemsWrapper = this.$elem.find('@bm-catalogue-items-wrapper');
        this.$itemsGridWrapper = this.$elem.find('@bm-catalogue-items-grid');
        this.$items = this.$itemsGridWrapper.find('@bm-catalogue-item');
        this.$itemsSpecialWrapper = this.$elem.find('@bm-catalogue-items-special');
        this.$itemsSpecial = this.$itemsSpecialWrapper.find('@bm-catalogue-item');

        this._menu = null;
        this._items = [];

        this._initMenu();
        this._initItems();
        this._updateItems();
        this._bindEvents();

        //this._items[0]._setMoreInfoVisible(true);
        this._items[0]._showPopup();
      },

      _bindEvents: function _bindEvents() {},

      _initItems: function _initItems() {
        var self = this;
        this.$items.each(function () {
          var instance = new CatalogueItem({
            element: $(this)
          });
          self._items.push(instance);
        });
      },

      _initMenu: function _initMenu() {
        if (!BM.tools.isNull(this._menu)) {
          return;
        }

        this._menu = new CatalogueMenu({
          element: this.$menu
        });
        this._menu.on('category-selected', (function (categoryName, special) {
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
        }).bind(this));
      },

      _updateItems: function _updateItems() {
        if (BM.tools.client.isTouch()) {
          return;
        }

        var self = this;
        this.$items.filter(':visible').each(function (i, el) {
          var handler = self._getItemHandler(this);
          if (!BM.tools.isNull(handler)) {
            (i + 1) % 4 === 0 ? handler.dockMoreToRight() : handler.dockMoreToLeft();
          }
        });
      },

      _getItemHandler: function _getItemHandler(el) {
        return this._items.filter(function (item) {
          return item.el.get(0) === el;
        })[0] || null;
      }

    });

    new CatalogueInit({
      element: $(document.body).find('@bm-page-catalogue')
    });

    provide(CatalogueInit);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueItem', ['extend', 'baseView', 'PopupItem'], function (provide, extend, BaseView, PopupItem) {

    var CatalogueItem = extend(BaseView),
        $class = CatalogueItem,
        $super = $class.superclass,
        $window = $(window);

    var MORE_INFO_FADE_DISTANCE = 70,
        MORE_INFO_FADE_BOUNDS = { fr: 1, to: 0.1 };

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }

        this._config = {};

        this.$content = this.el.find('@bm-catalogue-item-content');
        this.$moreInfo = this.el.find('@bm-catalogue-item-more-info');

        this._offset = null;
        this._contentWidth = null;
        this._widthWithMore = null;

        this._parseConfig();
        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        this.el.on(BM.helper.event.clickName(), (function (event) {
          this._onClick();
        }).bind(this));
        this.el.on('mouseover', (function (event) {
          this._onMouseOver(event);
        }).bind(this));
        this.el.on('mouseout', (function (event) {
          this._onMouseOut(event);
        }).bind(this));
        this.el.on('mousemove', (function (event) {
          this._onMouseMove(event);
        }).bind(this));
      },

      _onClick: function _onClick(event) {
        this._showPopup();
      },

      _onMouseOver: function _onMouseOver(event) {
        if (this._isMoreVisible()) {
          return;
        }
        this._setMoreInfoVisible(true);
        BM.helper.browser.triggerRerender();
      },

      _onMouseOut: function _onMouseOut(event) {
        this._setMoreInfoVisible(false);
      },

      _onMouseMove: function _onMouseMove(event) {
        this._updateElementOffset();
        this._updateContentWidth();
        this._updateWidthWithMore();

        var posX = event.pageX - this._offset.left,
            bounds = MORE_INFO_FADE_BOUNDS,
            boundsDiff = bounds.fr - bounds.to;

        if (this._isMoreDockedToLeft()) {
          var fadeStart = this._contentWidth,
              fadeEnd = this._contentWidth + MORE_INFO_FADE_DISTANCE;

          if (posX > fadeEnd) {
            this._setMoreInfoVisible(false);
          } else if (posX > fadeStart && posX < fadeEnd) {
            var pos = posX - this._contentWidth,
                posRel = pos / MORE_INFO_FADE_DISTANCE,
                opacity = bounds.to + boundsDiff * (1 - posRel);

            this._setMoreOpacity(opacity);
          }
        } else if (this._isMoreDockedToRight() && !BM.tools.isNull(this._widthWithMore) && posX <= 0) {

          var fadeEnd = MORE_INFO_FADE_DISTANCE,
              pos = Math.abs(posX);

          if (pos > fadeEnd) {
            this._setMoreInfoVisible(false);
          } else {
            var posRel = pos / MORE_INFO_FADE_DISTANCE,
                opacity = bounds.to + boundsDiff * (1 - posRel);

            this._setMoreOpacity(opacity);
          }
        }
      },

      _showPopup: function _showPopup() {
        if (BM.tools.isNull(this._popup)) {
          this._popup = new PopupItem({
            data: this._config
          });
        }
        this._popup.show();
      },

      _updateElementOffset: function _updateElementOffset() {
        if (BM.tools.isNull(this._offset)) {
          this._offset = this.el.offset();
        }
      },

      _updateContentWidth: function _updateContentWidth() {
        if (BM.tools.isNull(this._contentWidth)) {
          this._contentWidth = this.$content.width();
        }
      },

      _updateWidthWithMore: function _updateWidthWithMore() {
        if (BM.tools.isNull(this._widthWithMore) && this.el.hasClass('m-dock-more-to-right')) {
          this._widthWithMore = this.el.width();
        }
      },

      _setMoreInfoVisible: function _setMoreInfoVisible(bool) {
        bool ? this.el.addClass('m-more-info-visible') && this._setMoreOpacity(1) : this.el.removeClass('m-more-info-visible');
      },

      _setMoreOpacity: function _setMoreOpacity(value) {
        value = Math.min(1, Math.max(0, value));
        this.$moreInfo.css({
          'opacity': value
        });
      },

      _isMoreDockedToLeft: function _isMoreDockedToLeft() {
        return !this.el.hasClass('m-dock-more-to-right');
      },

      _isMoreDockedToRight: function _isMoreDockedToRight() {
        return this.el.hasClass('m-dock-more-to-right');
      },

      _isMoreVisible: function _isMoreVisible() {
        return this.el.hasClass('m-more-info-visible');
      },

      dockMoreToRight: function dockMoreToRight() {
        this.el.addClass('m-dock-more-to-right');
      },

      dockMoreToLeft: function dockMoreToLeft() {
        this.el.removeClass('m-dock-more-to-right');
      }

    });

    provide(CatalogueItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueMenu', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var CatalogueMenu = extend(BaseView),
        $class = CatalogueMenu,
        $super = $class.superclass,
        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }

        this.$list = this.$elem.find('@bm-page-catalogue-list');
        this.$select = this.$elem.find('@bm-page-catalogue-select');
        this.$listItems = this.$list.find('@bm-page-catalogue-menu-item');
        this.$selectItems = this.$select.find('@bm-page-catalogue-menu-select-item');
        //this.$selectItems = this.$select.find('@bm-page-catalogue-menu-item');

        this.$selectDropdownButton = this.el.find('@bm-page-catalogue-menu-select-dropdown-button');
        this.$selectCurrentItemWrapper = this.el.find('@bm-page-catalogue-menu-select-current-item-wrapper');

        this._offset = null;
        this._selectItemHeight = null;

        this._updateSelect();
        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        var self = this,
            clickName = BM.helper.event.clickName();

        this.$selectItems.on(clickName, function (event) {
          self._onSelectItemClick(event, this);
        });
        this.$listItems.on(clickName, (function (event) {
          this._onListItemClick(event);
        }).bind(this));
      },

      _updateSelect: function _updateSelect() {
        this._updateMenuOffset();
        this._updateSelectItemHeight();
        //this._updateSelectItemWrapper();

        this._updateItemsPosition();
      },

      _updateItemsPosition: function _updateItemsPosition() {
        var self = this;
        this.$selectItems.each(function (i, el) {
          if (i < 1) {
            return;
          }

          var $item = $(this);console.log();
          $item.css({
            'transform': 'translateY(' + self._selectItemHeight * i + 'px)'
          });
        });
      },

      _updateMenuOffset: function _updateMenuOffset() {
        if (!BM.tools.isNull(this._offset)) {
          this._updateMenuOffset = function () {};
          return;
        }
        this._offset = this.el.offset();
      },

      _updateSelectItemHeight: function _updateSelectItemHeight() {
        if (!BM.tools.isNull(this._selectItemHeight)) {
          this._updateSelectItemHeight = function () {};
          return;
        }
        this._selectItemHeight = this._getSelectedSelectItem().height();
      },

      _getSelectedSelectItem: function _getSelectedSelectItem() {
        return this.$selectItems.filter(function () {
          return $(this).hasClass('m-selected');
        });
      },

      _updateSelectItemWrapper: function _updateSelectItemWrapper() {
        this.$selectItems.each(function () {
          var $this = $(this),
              $item = $this.find('@bm-page-catalogue-menu-item');
          if ($item.hasClass('m-selected')) {
            $this.addClass('m-selected');
          } else {
            $this.removeClass('m-selected');
          }
        });
      },

      _onSelectItemClick: function _onSelectItemClick(event, $item) {
        $item = $($item);
        if ($item.hasClass('m-selected')) {
          this._toggleMenu();
        } else {
          this.$selectItems.removeClass('m-selected');
          $item.addClass('m-selected');
          this._toggleMenu();

          var $menuItem = $item.find('@bm-page-catalogue-menu-item');
          this._notify('category-selected', $menuItem.data('name'), $menuItem.data('special'));
        }
      },

      _toggleMenu: function _toggleMenu() {
        if (this._isSelectExpanded()) {
          this._collapseSelect();
        } else {
          this._expandSelect();
        }
      },

      _isSelectExpanded: function _isSelectExpanded() {
        return this.el.hasClass('m-select-expanded');
      },

      _expandSelect: function _expandSelect() {
        this.el.addClass('m-select-expanded');
      },

      _collapseSelect: function _collapseSelect() {
        this.el.removeClass('m-select-expanded');
      },

      _onListItemClick: function _onListItemClick(event) {
        var $item = $(event.target),
            name = $item.data('name');

        if (BM.tools.isNull($item.data('name'))) {
          $item = $item.parent('.bm-page-catalogue-menu-item');
          name = $item.name;
        }

        this.$listItems.removeClass('m-selected');
        $item.addClass('m-selected');
        this._notify('category-selected', $item.data('name'), $item.data('special'));
      }

    });

    provide(CatalogueMenu);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueBackground', ['extend', 'baseView', 'EventDispatcher'], function (provide, extend, BaseView, EventDispatcher) {

    var CatalogueBackground = extend(BaseView),
        $class = CatalogueBackground,
        $super = $class.superclass,
        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._items = {
          mono: this._getItem('mono'),
          aroma: this._getItem('aroma')
        };
        this._itemsArr = [this._items.mono, this._items.aroma];

        this._baseHeight = null;
        this._currentItem = this._items.mono;
        this._lastOffsetValue = null;

        this._updateFull();
        this._bindEvents();

        setTimeout((function () {
          this._updateFull();
        }).bind(this), 300);
      },

      _getItem: function _getItem(name) {
        var $elem = this.$elem.find('[data-item=' + name + ']');
        return {
          elem: $elem,
          size: $elem.data('size'),
          height: $elem.height(),
          aspect: parseFloat($elem.data('aspect'))
        };
      },

      _bindEvents: function _bindEvents() {
        EventDispatcher.on('window-resize', (function () {
          this._updateFull();
        }).bind(this));
      },

      setCurrentItem: function setCurrentItem(itemName) {
        if (itemName === this._currentItem.elem.data('item')) {
          return;
        }

        var item = this._getItem(itemName);
        if (item.elem.length < 1) {
          return;
        }

        item.elem.prependTo(this.$elem);
        item.elem.addClass('m-visible');
        this._currentItem.elem.removeClass('m-visible');
        this._currentItem = item;

        this._notify('update', item.elem.data('item'));
      },

      _getCurrentItem: function _getCurrentItem() {},

      setProgress: function setProgress(value) {
        if (!BM.tools.isNumber(value)) {
          return;
        }

        value = Math.min(100, Math.max(0, value));
        this._setCurrentItemOffset(value);
      },

      _updateFull: function _updateFull() {
        this._updateOrientation();
        this._updateBaseHeightValue();
        this._updateCurrentItemOffset();
      },

      _setCurrentItemOffset: function _setCurrentItemOffset(value) {
        this._lastOffsetValue = value;

        var offset = (this._currentItem.height - this._baseHeight) / 100 * value * -1;

        window.requestAnimationFrame((function () {
          this._currentItem.elem.css({
            'transform': 'translateY(' + offset + 'px)'
          });
        }).bind(this));
      },

      _updateOrientation: function _updateOrientation() {
        var windowAspect = window.innerWidth / window.innerHeight;
        this._itemsArr.forEach(function (item) {
          if (item.aspect >= windowAspect) {
            item.elem.addClass('m-orientation-inverted');
          } else {
            item.elem.removeClass('m-orientation-inverted');
          }
        });
      },

      _updateBaseHeightValue: function _updateBaseHeightValue() {
        this._baseHeight = this.$elem.height();
      },

      _updateCurrentItemOffset: function _updateCurrentItemOffset() {
        if (!BM.tools.isNull(this._lastOffsetValue)) {
          this._setCurrentItemOffset(this._lastOffsetValue);
        }
      }

    });

    provide(CatalogueBackground);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueInitOld', ['extend', 'baseView', 'CatalogueBackground', 'CatalogueMenu', 'CatalogueItem', 'EventDispatcher'], function (provide, extend, BaseView, Background, Menu, Item, EventDispatcher) {

    var CatalogueInit = extend(BaseView),
        $class = CatalogueInit,
        $super = $class.superclass,
        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._backgroundHandler = null;
        this._menuHandler = null;

        this.$elemBackground = this.$elem.find('@bm-catalogue-background');
        this.$elemMenu = this.$elem.find('@bm-catalogue-menu');

        this.$elemItemsWrapper = this.$elem.find('@bm-catalogue-items-wrapper');

        this._groupes = [this.$elemGroupClassic = this.$elem.find('@bm-catalogue-item-group-classic'), this.$elemGroupAroma = this.$elem.find('@bm-catalogue-item-group-aroma')];

        this._groupesRanges = [];

        //this._saveGroupsRanges();
        //this._initBackground();
        //this._initMenu();
        this._initItems();
        //this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        EventDispatcher.on('window-resize', (function () {
          this._saveGroupsRanges();
        }).bind(this));
      },

      _initBackground: function _initBackground() {
        if (BM.tools.isNull(this._backgroundHandler)) {
          this._backgroundHandler = new Background({
            element: this.$elemBackground
          });
          this._backgroundHandler.on('update', (function (itemName) {
            this._onBackgroundUpdate(itemName);
          }).bind(this));
          EventDispatcher.on('window-scroll', (function () {
            this._updateBackground();
          }).bind(this));
        }
      },

      _initMenu: function _initMenu() {
        if (BM.tools.isNull(this._menuHandler)) {
          this._menuHandler = new Menu({
            element: this.$elemMenu
          });
        }
      },

      _onBackgroundUpdate: function _onBackgroundUpdate(itemName) {
        if (!BM.tools.isNull(this._menuHandler)) {
          this._menuHandler.focusItem(itemName);
        }
      },

      _initItems: function _initItems() {
        var lastItem;
        this.$elemItemsWrapper.each(function () {
          $(this).find('@bm-catalogue-item').each(function () {
            lastItem = new Item({
              element: $(this)
            });
          });
        });
        //lastItem.showPopup();
      },

      _saveGroupsRanges: function _saveGroupsRanges() {
        var previousTopRange = 0;

        this._groupesRanges.length = 0;
        this._groupesRanges = [];

        this._groupes.forEach((function ($group) {
          var bottomRange = $group.offset().top + $group.height();

          this._groupesRanges.push({
            elem: $group,
            height: $group.height(),
            top: previousTopRange,
            bottom: bottomRange
          });
          previousTopRange = bottomRange + 1;
        }).bind(this));
      },

      _updateBackground: function _updateBackground() {
        var range = this._getCurrentRange();

        if (BM.tools.isNull(range)) {
          return;
        }
        this._updateParallax(range);
        this._updateImage(range.elem);
      },

      _updateParallax: function _updateParallax(range) {
        var scrollTop = $window.scrollTop(),
            scrollProgress = parseInt(((scrollTop - range.top) / (range.bottom - range.top) * 100).toFixed(0), 10);

        if (!BM.tools.isNull(this._backgroundHandler)) {
          this._backgroundHandler.setProgress(scrollProgress);
        }
      },

      _updateImage: function _updateImage($group) {
        if (!BM.tools.isNull(this._backgroundHandler)) {
          this._backgroundHandler.setCurrentItem($group.data('name'));
        }
      },

      _getCurrentGroupByRange: function _getCurrentGroupByRange() {
        var range = this._getCurrentRange();
        if (!BM.tools.isNull(range)) {
          return range.elem;
        }
      },

      _getCurrentRange: function _getCurrentRange() {
        var barrier = $window.scrollTop() + window.innerHeight / 2,
            range,
            i,
            l = this._groupesRanges.length;

        for (i = 0; i < l; ++i) {
          range = this._groupesRanges[i];
          if (barrier >= range.top && barrier <= range.bottom) {
            return range;
          }
        }
        return null;
      }

    });

    new CatalogueInit({
      element: $(document.body).find('@bm-catalogue-index')
    });

    provide(CatalogueInit);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueItemOld', ['extend', 'baseView', 'PopupItem'], function (provide, extend, BaseView, PopupItem) {

    var CatalogueItem = extend(BaseView),
        $class = CatalogueItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._popupHandler = null;

        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        this.$elem.on(BM.helper.event.clickName(), (function (event) {
          this._onClick(event);
        }).bind(this));
      },

      _onClick: function _onClick(event) {
        this.showPopup();
      },

      _initPopup: function _initPopup() {
        if (BM.tools.isNull(this._popupHandler)) {
          this._popupHandler = new PopupItem();
        }
      },

      showPopup: function showPopup() {
        this._initPopup();
        this._popupHandler.show();
      }

    });

    provide(CatalogueItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('CatalogueMenuOld', ['extend', 'baseView', 'EventDispatcher'], function (provide, extend, BaseView, EventDispatcher) {

    var CatalogueMenu = extend(BaseView),
        $class = CatalogueMenu,
        $super = $class.superclass,
        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this.$elemsItems = this.$elem.find('@bm-catalogue-menu-item');
        this._offsetTop = this.$elem.offset().top;

        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        EventDispatcher.on('window-scroll', (function () {
          this._updatePosition();
        }).bind(this));
      },

      _updatePosition: function _updatePosition() {
        if ($window.scrollTop() >= this._offsetTop) {
          this.$elem.addClass('m-fixed');
        } else {
          this.$elem.removeClass('m-fixed');
        }
      },

      focusItem: function focusItem(itemName) {
        var item = this.$elemsItems.filter('[data-item=' + itemName + ']');
        if (item.length > 0) {
          this.$elemsItems.removeClass('m-focused');
          item.addClass('m-focused');
        }
      }

    });

    provide(CatalogueMenu);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('ItemModel', ['extend', 'Model'], function (provide, extend, Model) {

    var ItemModel = extend(Model),
        $class = ItemModel,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);
      },

      getPrice: function getPrice() {
        return this._getPrice(250);
      },

      getPrice250: function getPrice250() {
        return this.getPrice();
      },

      getPrice500: function getPrice500() {
        return this._getPrice(500);
      },

      getPrice1000: function getPrice1000() {
        return this._getPrice(1000);
      },

      _getPrice: function _getPrice(amount) {
        var result = null;
        this._data.price.forEach(function (item) {
          if (item.amount === amount) {
            result = item;
          }
        });
        return result.value;
      }

    });

    BM.tools.mixin($class.prototype, {});

    provide(ItemModel);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $) {

  modules.define('beforeUIModulesInit', ['InitGlobalStylesModifiers', 'InitEventDispatcher'], function (provide) {

    provide();
  });

  modules.define('ui-modules', ['beforeUIModulesInit', 'initTransformOriginDependentElements', 'SideMenuInit'
  /*'initFixedHeader'
  'beforeUIModulesInit',
  'initCartHeader',
  'initBlockRecent',
  'initButtonsAddToCart'*/

  ], function (provide) {
    if (BM.tools.client.isTouch()) {
      $('body').addClass('m-touch');
    } else {
      $('body').addClass('m-desktop');
    }
    provide();
  });
})(undefined, undefined.modules, undefined.jQuery);
'use strict';

(function (window, modules, $, BM) {

    modules.define('HeaderCart', ['basePubSub', 'extend', 'CartProcessor'], function (provide, PubSub, extend, cart) {

        var HeaderCart = extend(PubSub),
            $class = HeaderCart,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize: function initialize(config) {
                $super.initialize.apply(this, arguments);

                if (!config || !config.element) {
                    return;
                }

                this.$elem = config.element;
                this.$elemCounter = this.$elem.find('@b-header-cart-counter');
                this.$elemCounterText = this.$elem.find('@b-header-cart-counter-text');
                this.$elemButtonOrder = this.$elem.find('@b-header-cart-button-order');

                this._setupEvents();
                this._updateData();
            },

            _setupEvents: function _setupEvents() {
                var me = this;
                cart.on('update', function () {
                    me._updateData();
                });
            },

            _showCounter: function _showCounter() {
                this.$elemCounter.attr('data-visible', 'true');
            },

            _hideCounter: function _hideCounter() {
                this.$elemCounter.attr('data-visible', 'false');
            },

            _updateData: function _updateData() {
                this._updateDataCounter();
            },

            _updateDataCounter: function _updateDataCounter() {
                var amount = cart.getTotalItems();
                if (amount < 1) {
                    this._hideCounter();
                    this._hideButtonOrder();
                } else {
                    this._updateCounterText();
                    this._showCounter();
                    this._showButtonOrder();
                }
            },

            _showButtonOrder: function _showButtonOrder() {
                this.$elemButtonOrder.attr('data-visible', 'true');
            },

            _hideButtonOrder: function _hideButtonOrder() {
                this.$elemButtonOrder.attr('data-visible', 'false');
            },

            _updateCounterText: function _updateCounterText() {
                var amount = cart.getTotalItems();
                this.$elemCounterText.html(amount);
            },

            destroy: function destroy() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(HeaderCart);
    });

    modules.define('initCartHeader', ['HeaderCart'], function (provide, HeaderCart) {

        var headerCart = new HeaderCart({
            element: $('@b-header-cart')
        });

        provide();
    });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, radio) {

    modules.define('CartProcessorClass', ['basePubSub', 'extend'], function (provide, PubSub, extend) {

        var CartProcessor = extend(PubSub),
            $class = CartProcessor,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize: function initialize() {
                $super.initialize.apply(this, arguments);

                this._data = {
                    items: []
                };
            },

            setData: function setData(data) {
                if (data) {
                    if (typeof data === 'string') {
                        try {
                            data = JSON.parse(data);
                        } catch (e) {}
                    }
                    this._data = data;
                    this._notify('update');
                }
            },

            getData: function getData() {
                return this._data;
            },

            getTotalItems: function getTotalItems() {
                var total = 0;
                this._data.items.forEach(function (elem) {
                    total += elem.amount;
                });
                return total;
            },

            destroy: function destroy() {
                $super.destroy.apply(this, arguments);
            }

        });

        provide(CartProcessor);
    });

    modules.define('CartProcessor', ['CartProcessorClass'], function (provide, CartProcessor) {
        var $body = $(document.body),
            cart = new CartProcessor();

        try {
            cart.setData(JSON.parse($body.attr('data-cart-config')));
        } catch (e) {}

        provide(cart);
    });

    modules.define('initCartProcessor', ['CartProcessor'], function (provide, cart) {

        radio('b-cart-update').subscribe(function (data) {
            cart.setData(data);
        });

        provide();
    });
})(undefined, undefined.modules, undefined.jQuery, undefined.radio);
'use strict';

(function (window, modules, $, BM) {

  modules.define('ButtonNumber', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var ControlButtonNumber = extend(BaseView),
        $class = ControlButtonNumber,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._value = 0;

        this.$elemInputValue = this.$elem.find('@bm-button-number-input-value');
        this.$elemMinus = this.$elem.find('@bm-button-number-minus');
        this.$elemPlus = this.$elem.find('@bm-button-number-plus');
        this.$elemValue = this.$elem.find('@bm-button-number-value');

        this._bindEvents();
        this.update();
      },

      _bindEvents: function _bindEvents() {
        this.$elemMinus.on(BM.helper.event.clickName(), (function (event) {
          this._onMinusClick(event);
        }).bind(this));

        this.$elemPlus.on(BM.helper.event.clickName(), (function (event) {
          this._onPlusClick(event);
        }).bind(this));
      },

      _onMinusClick: function _onMinusClick(event) {
        this._decValue();
      },

      _onPlusClick: function _onPlusClick(event) {
        this._incValue();
      },

      _incValue: function _incValue() {
        this.setValue(this._value + 1);
      },

      _decValue: function _decValue() {
        this.setValue(Math.max(0, this._value - 1));
      },

      setValue: function setValue(value) {
        if (BM.tools.isNumber(value) && value >= 0) {
          this._value = value;
          this.update();
          this._notify('change', this._value);
        }
      },

      update: function update() {
        if (this._value < 1) {
          this.$elem.removeClass('m-value-present');
          this.$elemMinus.addClass('m-disabled');
        } else {
          this.$elem.addClass('m-value-present');
          this.$elemValue.html(this._value);
          this.$elemMinus.removeClass('m-disabled');
        }
      }

    });

    provide(ControlButtonNumber);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  var dispatcherInstance = null;

  modules.define('EventDispatcherConstructor', ['extend', 'basePubSub'], function (provide, extend, PubSub) {

    var EventDispatcher = extend(PubSub),
        $class = EventDispatcher,
        $super = $class.superclass,
        $window = $(window);

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        this._timeoutNotifyResize = null;

        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        $window.one('resize', (function onWindowResize() {
          if (!BM.tools.isNull(this._timeoutNotifyResize)) {
            clearTimeout(this._timeoutNotifyResize);
            this._timeoutNotifyResize = null;
          }

          this._timeoutNotifyResize = setTimeout((function () {
            this._notify('window-resize');
          }).bind(this), 200);

          setTimeout((function () {
            $window.one('resize', onWindowResize.bind(this));
          }).bind(this), 50);
        }).bind(this));

        $window.one('scroll', (function onWindowScroll() {
          this._notify('window-scroll');
          setTimeout((function () {
            $window.one('scroll', onWindowScroll.bind(this));
          }).bind(this), 25);
        }).bind(this));
      }

    });

    provide(EventDispatcher);
  });

  modules.define('InitEventDispatcher', ['EventDispatcherConstructor'], function (provide, Dispatcher) {
    dispatcherInstance = new Dispatcher();
    provide();
  });

  modules.define('EventDispatcher', [], function (provide) {
    provide(dispatcherInstance);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, document, BM, $, modules, radio) {
  'use strict';

  var dynamicContentModule = function dynamicContentModule(provide, extend, PubSub) {

    var DynamicContent = extend(PubSub),
        $class = DynamicContent,
        $super = $class.superclass,
        DynamicEffect = {
      FADE: 1,
      SLIDE: 2
    };

    BM.tools.mixin($class.prototype, {

      initialize: function initialize(config) {
        $super.initialize.apply(this, arguments);

        this._element = null;

        if (!config) {
          return;
        }

        this.setElement(config.element);

        this._effect = DynamicEffect.FADE;
        this._firstStep = this._getStepInitial();

        this.setConfig(config);

        this._currentElement = this._firstStep;
        this._stepsStack = [];
        this._updateInProgress = false;

        //this._updateSize();
        //this.updateLayout();
      },

      setConfig: function setConfig(config) {
        if (!BM.tools.isUndefined(config)) {
          if (!BM.tools.isUndefined(config.element)) {
            this.setElement(config.element);
          }
          if (!BM.tools.isUndefined(config.effect)) {
            this.setDynamicEffect(config.effect);
          }
          if (!BM.tools.isUndefined(config.firstStep)) {
            this.setFirstStep(config.firstStep);
          }
        }
      },

      setElement: function setElement(element) {
        if (!BM.tools.isUndefined(element)) {
          this._element = element;
        }
      },

      setDynamicEffect: function setDynamicEffect(effect) {
        if (!BM.tools.isUndefined(effect)) {
          this._effect = effect;
        }
      },

      setFirstStep: function setFirstStep(firstStep) {
        var step;
        if (!BM.tools.isUndefined(firstStep)) {
          step = this._getStep(firstStep);
          if (step.length > 0) {
            this._firstStep = step;
          }
        }
      },

      _updateSize: function _updateSize(data) {
        return;
        data = data || {};

        var me = this,
            oldHeight = data.oldHeight || this._currentElement.height(),
            newHeight = data.newHeight || height,
            updateCallback = data.callback || function () {};

        /*if (!BM.tools.isUndefined(height) && BM.tools.isUndefined(callback)) {
         if (BM.tools.isNumber(height)) {
         newHeight = height;
         } else if (BM.tools.isFunction(height)) {
         updateCallback = height;
         }
         }*/

        if (BM.tools.isNull(newHeight)) {
          newHeight = this._currentElement.height();
        }

        this._element.css('height', this._element.height());
        this._element.get(0).offsetHeight;
        this._element.css('height', newHeight);

        setTimeout(function () {
          me._element.css('height', '');
          updateCallback();
        }, 350);
      },

      update: function update() {
        //this._updateSize();
      },

      reset: function reset() {
        this.setStep(this._getStepFirst().attr('data-step'));
      },

      clearHeight: function clearHeight() {
        this._element.css('height', '');
      },

      clearStepsStack: function clearStepsStack() {
        this._stepsStack.length = 0;
        this._stepsStack = [];
      },

      /*showStepBackup : function(n, callback) {
       var me = this,
       nextStep    = n,
       currentStep = this._currentElement.attr('data-step');
        if (this._isCurrentStep(n) || !this._isStepExist(n)) {
       return;
       }
        this._stepsStack.push(currentStep);
        this._notify('fade-out-start', currentStep, nextStep);
       this._fadeOut(function(){
       var currentHeight = this._currentElement.height(),
       newHeight;
        me._notify('fade-out-end', currentStep, nextStep);
        me.setStep(n);
       newHeight = this._currentElement.height();
        me._notify('resize-start', currentStep, nextStep);
        me._resize(currentHeight, newHeight, function(){
        me._notify('resize-end', currentStep, nextStep);
       me._notify('fade-in-start', currentStep, nextStep);
        me._fadeIn(function(){
       me._notify('fade-in-end', currentStep, nextStep);
       if (BM.tools.isFunction(callback)) {
       callback();
       }
       });
       });
       });
       },*/

      showStep: function showStep(stepNextName, callback, forceCallback, skipStack) {
        if (this._isCurrentStep(stepNextName) || !this._isStepExist(stepNextName) || this.isUpdateInProgress()) {
          if (forceCallback === true && BM.tools.isFunction(callback)) {
            callback();
          }
          return;
        }

        var me = this,
            stepCurrent = this._currentElement,
            stepCurrentName = stepCurrent.attr('data-step'),
            stepNext = this._getStep(stepNextName),
            heightCurrent = stepCurrent.height(),
            heightNext;

        this._updateInProgress = true;

        if (skipStack !== true) {
          this._stepsStack.push(stepCurrent.attr('data-step'));
        }

        this._notify('fade-out-start', stepCurrentName, stepNextName);
        this._fadeOut(function () {
          me._notify('fade-out-end', stepCurrentName, stepNextName);

          me._setHeightNoTransition(heightCurrent);
          me.setStep(stepNextName);
          heightNext = stepNext.height();

          me._notify('resize-start', stepCurrentName, stepNextName);
          me._element.css('height', heightNext);

          setTimeout(function () {
            me._notify('resize-end', stepCurrentName, stepNextName);
            me._notify('fade-in-start', stepCurrentName, stepNextName);

            me._fadeIn(function () {
              me._notify('fade-in-end', stepCurrentName, stepNextName);
              //me._element.css('height', '');
              me._setHeightNoTransition('');
              if (BM.tools.isFunction(callback)) {
                callback();
              }
              me._updateInProgress = false;
            });
          }, 350);
        });
      },

      showPreviousStep: function showPreviousStep() {
        var step = this._stepsStack.pop();
        if (!BM.tools.isUndefined(step)) {
          this.showStep(step, function () {}, false, true);
        }
      },

      isStepsStackEmpty: function isStepsStackEmpty() {
        return this._stepsStack.length === 0;
      },

      setStep: function setStep(n) {
        var stepToShow = this._getStep(n);
        if (stepToShow.length > 0) {
          this._element.find('> [data-step]').removeClass('visible');
          stepToShow.addClass('visible');
          this._currentElement = stepToShow;
        }
      },

      _getStep: function _getStep(n) {
        return this._element.find('> [data-step=' + n + ']');
      },

      _getStepInitial: function _getStepInitial() {
        var result;
        result = this._element.find('.visible[data-step]');
        if (result.length > 0) {
          result = result.eq(0);
        } else {
          result = this._getStepFirst();
        }
        return result;
      },

      _getStepFirst: function _getStepFirst() {
        return this._element.find('> [data-step]').eq(0);
      },

      _isStepExist: function _isStepExist(n) {
        return this._element.find('> [data-step=' + n + ']').length > 0;
      },

      isUpdateInProgress: function isUpdateInProgress() {
        return this._updateInProgress;
      },

      _isCurrentStep: function _isCurrentStep(n) {
        return this._currentElement.attr('data-step') === n.toString();
      },

      showNext: function showNext() {},

      showPrev: function showPrev() {},

      _fadeOut: function _fadeOut(callback) {
        this._unbindTransitionEnd();
        this._bindTransitionEnd(callback);
        this._element.attr('visible', 'false');
      },

      _fadeOut2: function _fadeOut2(callback) {
        this._unbindTransitionEnd();
        this._bindTransitionEnd(callback);
        this._element.attr('visible', 'false');
      },

      /*_resize : function(oldHeight, newHeight, callback) {
       this._updateSize(function(){
       if (typeof callback === 'function') {
       callback();
       }
       });
       },*/

      _fadeIn: function _fadeIn(callback) {
        this._unbindTransitionEnd();
        this._bindTransitionEnd(callback);
        this._element.removeAttr('visible');
      },

      _unbindTransitionEnd: function _unbindTransitionEnd() {
        this._element.unbindTransitionEnd();
      },

      _bindTransitionEnd: function _bindTransitionEnd(callback) {
        callback = callback || function () {};
        this._element.transitionEnd((function () {
          this._unbindTransitionEnd();
          callback();
          this._notify('fade-in-end');
        }).bind(this));
      },

      collapse: function collapse() {
        return this._fadeOut((function () {
          this._updateSize(0);
        }).bind(this));
      },

      getCurrentStepName: function getCurrentStepName() {
        return this._currentElement.attr('data-step');
      },

      _setHeightNoTransition: function _setHeightNoTransition(height) {
        this._element.attr('data-no-transition', 'true');
        this._triggerRender();
        this._element.css('height', height);
        this._triggerRender();
        this._element.removeAttr('data-no-transition');
      },

      _triggerRender: function _triggerRender() {
        this._element.get(0).offsetHeight;
      }

    });

    provide(DynamicContent);
  };

  modules.define('dynamicContent', ['extend', 'basePubSub'], dynamicContentModule);
})(undefined, undefined.document, undefined.BM, undefined.jQuery, undefined.modules, undefined.radio);
'use strict';

(function (window, modules, $, radio) {

  modules.define('InitGlobalStylesModifiers', [], function (provide) {

    var $body = $(document.body);

    if (BM.tools.client.isTouch()) {
      $body.addClass('m-touch');
    } else {
      $body.addClass('m-desktop');
    }

    provide();
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.radio);
'use strict';

(function (window, modules, $, radio) {

  modules.define('SideMenuInit', [], function (provide) {

    var $body = $(document.body),
        buttonToggleSideMenu = $('@bm-side-menu-toggle-button');

    buttonToggleSideMenu.on(BM.helper.event.clickName(), function (event) {
      if ($body.hasClass('m-side-menu-opened')) {
        $body.removeClass('m-side-menu-opened');
      } else {
        $body.addClass('m-side-menu-opened');
      }
    });
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.radio);
'use strict';

(function (window, modules, $, BM) {

  modules.define('ItemBrewingMethodItem', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var ItemBrewingMethodItem = extend(BaseView),
        $class = ItemBrewingMethodItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize(config) {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }

        this.$text = this.el.find('@bm-brewing-method-item-text');

        this._config = BM.tools.mixin({}, config);

        this.render();
      },

      render: function render() {
        if (!this._config.data) {
          return;
        }

        this.el.attr('data-name', this._config.data.name);
        this.el.attr('data-size', this._config.data.size || "normal");
        this.$text.html(this._config.data.label);
      },

      _getTemplateName: function _getTemplateName() {
        return 'bm-brewing-method-item-template';
      }

    });

    provide(ItemBrewingMethodItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('ItemFormOrder', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var ItemFormOrder = extend(BaseView),
        $class = ItemFormOrder,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }

        this._amount = null;
        this._grind = null;

        this.$amountItems = this.el.find('@bm-item-form-order-amount-item');
        this.$grindItems = this.el.find('@bm-item-form-order-grind-item');
        this.$buttonAdd = this.el.find('@bm-item-form-order-button-add');

        this._updateAmount();
        this._updateGrind();
        this._updateButton();

        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        var self = this,
            clickName = BM.helper.event.clickName();

        this.$buttonAdd.on(clickName, (function (event) {
          this._onButtonAddClick(event);
        }).bind(this));
        this.$amountItems.on(clickName, (function (event) {
          this._onAmountItemClick(event);
        }).bind(this));
        this.$grindItems.on(clickName, (function (event) {
          this._onGrindItemClick(event);
        }).bind(this));
      },

      _onButtonAddClick: function _onButtonAddClick() {
        this._notifyAdd();
      },

      _onAmountItemClick: function _onAmountItemClick(event) {
        var $this = $(event.target);
        while ($this.filter('[role=bm-item-form-order-amount-item]').length < 1) {
          $this = $this.parent();
        }

        this.$amountItems.removeClass('m-selected');
        $this.addClass('m-selected');

        this._updateButton();
        this._updateAmount();
      },

      _onGrindItemClick: function _onGrindItemClick(event) {
        var $this = $(event.target);
        while ($this.filter('[role=bm-item-form-order-grind-item]').length < 1) {
          $this = $this.parent();
        }

        this.$grindItems.removeClass('m-selected');
        this.$grindItems.removeClass('m-color-scheme-white');
        $this.addClass('m-selected');
        $this.addClass('m-color-scheme-white');

        this._updateButton();
        this._updateGrind();
      },

      setPrices: function setPrices(pricesArr) {
        pricesArr.forEach((function (price) {
          var $amountItem = this.$amountItems.filter(function () {
            return $(this).data('amount') == price.amount;
          }),
              $itemPrice = $amountItem.find('@bm-item-form-order-amount-item-price');

          $itemPrice.html(price.value + $itemPrice.data('text'));
        }).bind(this));
      },

      _updateAmount: function _updateAmount() {
        this._amount = this._getSelectedItemAmount().data('amount');
      },

      _updateGrind: function _updateGrind() {
        this._grind = this.$grindItems.filter('.m-selected').last().data('grind');
      },

      _getSelectedItemAmount: function _getSelectedItemAmount() {
        return this.$amountItems.filter('.m-selected').last();
      },

      _getSelectedItemGrind: function _getSelectedItemGrind() {
        return this.$grindItems.filter('.m-selected').last();
      },

      _updateButton: function _updateButton() {
        var amount = this._getSelectedItemAmount().data('amount');
        var grind = this._getSelectedItemGrind().find('.bm-brewing-method').data('config').grind;
        var textTemplate;

        /*if (grind.kind === "extrafine") {
          textTemplate = this.$buttonAdd.data('text-template-with-comma');
        } else {
          textTemplate = this.$buttonAdd.data('text-template-default');
        }*/

        textTemplate = this.$buttonAdd.data('text-template');
        textTemplate = textTemplate.replace('${amount}', amount);
        textTemplate = textTemplate.replace('${grind}', grind.label_full.toLowerCase());

        this.$buttonAdd.html(textTemplate);
      },

      _notifyAdd: function _notifyAdd() {
        var obj = {
          amount: this._amount,
          grind: this._grind
        };

        this._notify('add', obj);
      }

    });

    provide(ItemFormOrder);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('FormItemOrderOld', ['extend', 'baseView', 'FormItemSelectGrind', 'ButtonNumber'], function (provide, extend, BaseView, FormItemSelectGrind, ButtonNumber) {

    var FormItemOrder = extend(BaseView),
        $class = FormItemOrder,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._formSelectGrind = null;
        this._buttonNumber250 = null;
        this._buttonNumber500 = null;
        this._buttonNumber1kg = null;

        this.$elemFormSelectGrind = this.$elem.find('@bm-form-select-grind');
        this.$elemButtonNumber250 = this.$elem.find('@bm-button-number-250');
        this.$elemButtonNumber500 = this.$elem.find('@bm-button-number-500');
        this.$elemButtonNumber1kg = this.$elem.find('@bm-button-number-1kg');

        this._initFormSelectGrind();
        this._initButtonsNumber();
      },

      _initFormSelectGrind: function _initFormSelectGrind() {
        if (BM.tools.isNull(this._formSelectGrind)) {
          this._formSelectGrind = new FormItemSelectGrind({
            element: this.$elemFormSelectGrind
          });
          this._formSelectGrind.on('change', (function (value) {
            this._onFormSelectGrindChange(value);
          }).bind(this));
        }
      },

      _initButtonsNumber: function _initButtonsNumber() {
        if (BM.tools.isNull(this._buttonNumber250)) {
          this._buttonNumber250 = new ButtonNumber({
            element: this.$elemButtonNumber250
          });
          this._buttonNumber250.on('change', (function (value) {
            this._onButtonNumberChange('250', value);
          }).bind(this));
        }
        if (BM.tools.isNull(this._buttonNumber500)) {
          this._buttonNumber500 = new ButtonNumber({
            element: this.$elemButtonNumber500
          });
          this._buttonNumber500.on('change', (function (value) {
            this._onButtonNumberChange('500', value);
          }).bind(this));
        }
        if (BM.tools.isNull(this._buttonNumber1kg)) {
          this._buttonNumber1kg = new ButtonNumber({
            element: this.$elemButtonNumber1kg
          });
          this._buttonNumber1kg.on('change', (function (value) {
            this._onButtonNumberChange('1kg', value);
          }).bind(this));
        }
      },

      _onFormSelectGrindChange: function _onFormSelectGrindChange(value) {},

      _onButtonNumberChange: function _onButtonNumberChange(kind, value) {
        console.log(kind, value);
      }

    });

    provide(FormItemOrder);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('Item', ['extend', 'baseView', 'ItemModel', 'ItemFormOrder', 'ItemSpecsItem', 'ItemBrewingMethodItem'], function (provide, extend, BaseView, ItemModel, FormOrder, ItemSpecsItem, ItemBrewingMethodItem) {

    var Item = extend(BaseView),
        $class = Item,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize(config) {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._config = BM.tools.mixin({}, config);
        this._item = new ItemModel({ data: this._config.data });

        this._formOrder = null;
        this.$elemFormOrder = this.$elem.find('@bm-item-form-order');

        this.$name = this.el.find('@bm-item-name');
        this.$descriptionShort = this.el.find('@bm-item-description-short');
        this.$rating = this.el.find('@bm-item-rating');
        this.$price = this.el.find('@bm-item-price');
        this.$specsWrapper = this.el.find('@bm-item-specs');
        this.$description = this.el.find('@bm-item-description');
        this.$imageWrapper = this.el.find('@bm-item-image-wrapper');
        this.$image = this.el.find('@bm-item-image');
        this.$imagePlantation = this.el.find('@bm-item-image-plantation');
        this.$methodsWrapper = this.el.find('@bm-item-methods-wrapper');

        this._timeoutZoom = null;
        this._specs = [];
        this._methods = [];

        this._initFormOrder();
        this._updateFormOrder();
        this._bindEvents();
        this.render();
      },

      _bindEvents: function _bindEvents() {
        if (BM.tools.client.isTouch()) {
          this.$imageWrapper.on('tap', (function (event) {
            this._onImageWrapperTap();
          }).bind(this));
        } else {
          this.$imageWrapper.on('mouseover', (function (event) {
            this._onImageWrapperMouseOver();
          }).bind(this));
          this.$imageWrapper.on('mouseout', (function (event) {
            this._onImageWrapperMouseOut();
          }).bind(this));
        }
      },

      _onImageWrapperTap: function _onImageWrapperTap() {
        this._toggleZoom();
      },

      _onImageWrapperMouseOver: function _onImageWrapperMouseOver() {
        if (this._isZoomVisible()) {
          return;
        }

        this._clearTimeoutZoom();
        this._timeoutZoom = setTimeout((function () {
          this._showZoom();
        }).bind(this), 300);
      },

      _onImageWrapperMouseOut: function _onImageWrapperMouseOut() {
        this._clearTimeoutZoom();
        this._hideZoom();
      },

      _clearTimeoutZoom: function _clearTimeoutZoom() {
        if (!BM.tools.isNull(this._timeoutZoom)) {
          clearTimeout(this._timeoutZoom);
          this._timeoutZoom = null;
        }
      },

      _toggleZoom: function _toggleZoom() {
        if (this._isZoomVisible()) {
          this._hideZoom();
        } else {
          this._showZoom();
        }
      },

      _showZoom: function _showZoom() {
        this.el.addClass('m-scale-visible');
      },

      _hideZoom: function _hideZoom() {
        this.el.removeClass('m-scale-visible');
      },

      _isZoomVisible: function _isZoomVisible() {
        return this.el.hasClass('m-scale-visible');
      },

      render: function render() {
        if (!this._config.data) {
          return;
        }

        this.$name.html(this._config.data.name);
        this.$descriptionShort.html(this._config.data.descriptionShort);
        this.$rating.attr('data-value', this._config.data.rating);
        this.$price.html(this._item.getPrice250());
        this.$description.html(this._config.data.description);
        this.$image.attr('src', this._config.data.image.large);
        this.$imagePlantation.attr('src', this._config.data.imagePlantation.default);

        this._renderSpecs();
        this._renderBrewingMethods();
      },

      _renderSpecs: function _renderSpecs() {
        this._specs.forEach(function (spec) {
          spec.destroy();
        });
        this._specs.length = 0;
        this._specs = [];
        this.$specsWrapper.html('');

        this._config.data.specsWithLabels.forEach((function (specData) {
          var spec = new ItemSpecsItem({
            data: specData,
            options: {
              hint: true
            }
          });
          this.$specsWrapper.append(spec.getElement());
        }).bind(this));
      },

      _renderBrewingMethods: function _renderBrewingMethods() {
        this._methods.forEach(function (method) {
          method.destroy();
        });
        this._methods.length = 0;
        this._methods = [];
        this.$methodsWrapper.html('');

        this._config.data.methodsWithLabels.forEach((function (methodData) {
          var method = new ItemBrewingMethodItem({
            data: methodData
          });
          this.$methodsWrapper.append(method.getElement());
        }).bind(this));
      },

      _initFormOrder: function _initFormOrder() {
        if (BM.tools.isNull(this._formOrder)) {
          this._formOrder = new FormOrder({
            element: this.$elemFormOrder
          });
          this._formOrder.on('add', function (obj) {
            console.log(obj);
          });
        }
      },

      _updateFormOrder: function _updateFormOrder() {
        this._formOrder.setPrices(this._item.getData().price);
      },

      _getTemplateName: function _getTemplateName() {
        return 'bm-item-template';
      }

    });

    provide(Item);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('ItemSpecsItem', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var ItemSpecsItem = extend(BaseView),
        $class = ItemSpecsItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize(config) {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }

        this.$label = this.el.find('@bm-item-specs-item-label');
        this.$value = this.el.find('@bm-item-specs-item-value');
        this.$hint = this.el.find('@bm-item-specs-item-hint');

        this._timeoutShowHint = null;

        this._config = BM.tools.mixin({}, config);

        this._bindEvents();
        this.render();
      },

      _bindEvents: function _bindEvents() {
        if (BM.tools.client.isTouch()) {
          this._onLabelTap();
        } else {
          this.$label.on('mouseover', (function (event) {
            this._onLabelMouseOver();
          }).bind(this));
          this.$label.on('mouseout', (function (event) {
            this._onLabelMouseOut();
          }).bind(this));
        }
      },

      _onLabelMouseOver: function _onLabelMouseOver() {
        if (!this._isHintAvailable()) {
          return;
        }

        this._timeoutShowHint = setTimeout((function () {
          this._showHint();
        }).bind(this), 300);
      },

      _onLabelMouseOut: function _onLabelMouseOut() {
        if (!BM.tools.isNull(this._timeoutShowHint)) {
          clearTimeout(this._timeoutShowHint);
          this._timeoutShowHint = null;
        }
        this._hideHint();
      },

      _onLabelTap: function _onLabelTap() {
        if (!this._isHintAvailable()) {
          return;
        }

        this.$label.on('tap', (function (event) {
          this._toggleHint();
        }).bind(this));
      },

      _toggleHint: function _toggleHint() {
        if (this._isHintVisible()) {
          this._hideHint();
        } else {
          this._showHint();
        }
      },

      _showHint: function _showHint() {
        this.el.addClass('m-hint-visible');
      },

      _hideHint: function _hideHint() {
        this.el.removeClass('m-hint-visible');
      },

      _isHintVisible: function _isHintVisible() {
        return this.el.hasClass('m-hint-visible');
      },

      _isHintAvailable: function _isHintAvailable() {
        return this._config && this._config.data.description && this._config.options && this._config.options.hint === true;
      },

      render: function render() {
        if (!this._config.data) {
          return;
        }

        this.el.attr('data-name', this._config.data.name);
        this.$label.html(this._config.data.label);
        this.$value.attr('data-value', this._config.data.value);
        this.$hint.html(this._config.data.description);

        if (this._isHintAvailable()) {
          this.el.addClass('m-hint-available');
        }
      },

      _getTemplateName: function _getTemplateName() {
        return 'bm-item-specs-all-item-template';
      }
    });

    provide(ItemSpecsItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('OrderItem', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var OrderItem = extend(BaseView),
        $class = OrderItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }
      },

      _getTemplateName: function _getTemplateName() {
        return 'bm-order-item-template';
      }

    });

    provide(OrderItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('PopupItem', ['extend', 'popupBaseClass', 'dynamicContent', 'Item'], function (provide, extend, BasePopup, DynamicContent, Item) {

    var PopupItem = extend(BasePopup),
        $class = PopupItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize(config) {
        $super.initialize.call(this, {
          rootClassName: ['m-version-2', 'bm-popup-item'],
          useTemplate: true
        });

        this._config = BM.tools.mixin({}, config);

        this._dynamicContent = null;
        this._itemHandler = null;

        this.$elemDynamicContent = this.$elem.find('@bm-dynamic-content');
        this.$elemContent = this.$elem.find('@bm-popup-item-content');
        this.$elemButtonClose = this.$elem.find('@bm-popup-item-button-close');

        this._initDynamicContent();
        this._bindEvents();
        this._initItem();
      },

      _bindEvents: function _bindEvents() {
        this.$elemButtonClose.on(BM.helper.event.clickName(), (function () {
          this._onButtonCloseClick();
        }).bind(this));
      },

      _onButtonCloseClick: function _onButtonCloseClick() {
        this.hide();
      },

      _initDynamicContent: function _initDynamicContent() {
        if (BM.tools.isNull(this._dynamicContent)) {
          this._dynamicContent = new DynamicContent({
            element: this.$elemDynamicContent
          });
          this._dynamicContent.setStep('content');
        }
      },

      _initItem: function _initItem() {
        if (BM.tools.isNull(this._itemHandler)) {
          this._itemHandler = new Item({
            data: this._config.data
          });
          this.$elemContent.append(this._itemHandler.getElement());
        }
      },

      show: function show() {
        $super.show.apply(this, arguments);
        /*setTimeout(function() {
          this._dynamicContent.showStep('content');
        }.bind(this), 200);*/
        //this._dynamicContent.showStep('content');
      },

      _getTemplateName: function _getTemplateName() {
        return 'bm-popup-item-template';
      }

    });

    provide(PopupItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function (window, modules, $, BM) {

  modules.define('initTransformOriginDependentElements', ['extend', 'baseClass'], function (provide, extend, BaseClass) {
    var Module = (function (_BaseClass) {
      _inherits(Module, _BaseClass);

      function Module() {
        _classCallCheck(this, Module);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Module).apply(this, arguments));
      }

      _createClass(Module, [{
        key: 'initialize',
        value: function initialize() {
          _get(Object.getPrototypeOf(Module.prototype), 'initialize', this).apply(this, arguments);

          this.$elements = $('.j-transform-origin-dependent');

          $.each(this.$elements, function (index, element) {
            var $e = $(element);
            var savedOffset = $e.offset();
            var savedWidth = $e.width();

            $e.on('mouseover mousemove', function (e) {
              var relativeMouseX = undefined;
              var calculatedOrigin = undefined;

              if (e.pageX) {
                relativeMouseX = e.pageX - savedOffset.left;
                calculatedOrigin = (relativeMouseX / savedWidth).toFixed(1) * 100;
                calculatedOrigin = calculatedOrigin < 0 ? 0 : calculatedOrigin;

                //console.log(calculatedOrigin + '% 50%');
                //$e.attr('style', 'transform-origin: ' + calculatedOrigin + '% 50%;')

                $e.attr('data-transform-origin', calculatedOrigin);
              }
            });
            $e.on('mouseout', function (e) {
              //$e.css('transform-origin', '')
              $e.removeAttr('style');
            });
          });
        }
      }]);

      return Module;
    })(BaseClass);

    new Module();

    provide(Module);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('FormItemSelectGrindOld', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var FormItemSelectGrind = extend(BaseView),
        $class = FormItemSelectGrind,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this.$elemsWithUniqueId = this.$elem.find('@bm-form-unique-element');
        this.$elemsOptionsViaGrind = this.$elem.find('@bm-form-grind-option-via-grind');
        this.$elemsBrewingMethods = this.$elem.find('@bm-brewing-method-item');

        this.$elemViaTypeWrapper = this.$elem.find('@bm-form-select-grind-via-type-wrapper');

        this._setUniqueIds();
        this._bindEvents();
        window.o = this;
      },

      _bindEvents: function _bindEvents() {
        this.$elemsOptionsViaGrind.on('change', (function (event) {
          this._onOptionViaGrindChange(event);
        }).bind(this));
        this.$elemsBrewingMethods.on(BM.helper.event.clickName(), (function (event) {
          this._onBrewingMethodClick(event);
        }).bind(this));
      },

      _onOptionViaGrindChange: function _onOptionViaGrindChange(event) {
        this._setSelectViaGrindStateBlur(false);
        this._unselectViaMethodItems();
        this._notify('change', this.$elemsOptionsViaGrind.filter(':checked').val());
      },

      _onBrewingMethodClick: function _onBrewingMethodClick(event) {
        var targetElement = $(event.target);
        if (!targetElement.hasClass('bm-brewing-method')) {
          targetElement = targetElement.parent();
        }
        targetElement.addClass('m-selected');
        this.$elemsBrewingMethods.not(targetElement).removeClass('m-selected');
        this._setSelectViaGrindStateBlur(true);
        this.$elemsOptionsViaGrind.val([]);
        this._notify('change', targetElement.data('name'));
      },

      _setUniqueIds: function _setUniqueIds() {
        var postfix = this.getInstanceId();

        this.$elemsWithUniqueId.each(function () {
          var $this = $(this);
          if ($this.prop('tagName') === 'LABEL') {
            $this.attr('for', $this.attr('for') + '-' + postfix);
          } else if ($this.prop('tagName') === 'INPUT') {
            $this.attr('id', $this.attr('id') + '-' + postfix);
            $this.attr('name', $this.attr('name') + '-' + postfix);
          }
        });
      },

      _setSelectViaGrindStateBlur: function _setSelectViaGrindStateBlur(bool) {
        if (bool) {
          this.$elemViaTypeWrapper.addClass('m-blur');
        } else {
          this.$elemViaTypeWrapper.removeClass('m-blur');
        }
      },

      _unselectViaMethodItems: function _unselectViaMethodItems() {
        this.$elemsBrewingMethods.removeClass('m-selected');
      }

    });

    provide(FormItemSelectGrind);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, modules, $, BM) {

  modules.define('ItemFormOrderSelectedItem', ['extend', 'baseView'], function (provide, extend, BaseView) {

    var ItemFormOrderSelectedItem = extend(BaseView),
        $class = ItemFormOrderSelectedItem,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize: function initialize() {
        $super.initialize.call(this, {
          useTemplate: true
        });

        if (!this.el) {
          return;
        }

        this._bindEvents();
      },

      _bindEvents: function _bindEvents() {
        var self = this;
        var clickName = BM.helper.event.clickName();
      },

      _getTemplateName: function _getTemplateName() {
        return 'bm-item-form-order-selected-item';
      }

    });

    provide(ItemFormOrderSelectedItem);
  });
})(undefined, undefined.modules, undefined.jQuery, undefined.BM);
'use strict';

(function (window, document, modules, BM) {
  var config = BM.config || {},
      mainConfig = document.body.getAttribute('data-config'),
      parsedMainConfig = JSON.parse(mainConfig) || {},
      assetHost = parsedMainConfig.assetHost || '';

  var getWithVersion = function getWithVersion(filename) {
    var debug = config.debug || parsedMainConfig.debug || false,
        version = parsedMainConfig.version || new Date();

    //if (!debug) {
    //filename = filename.replace('js', 'min.js');
    //}

    return filename += '?t=' + version;
  };

  config.loadScriptsConfig = {

    'default': function _default() {
      modules.require('ui-modules');
    },

    'catalogue-index': function catalogueIndex() {
      modules.require('ui-modules');
      modules.require('CatalogueInit');
    }
  };
})(undefined, undefined.document, undefined.modules, undefined.BM = undefined.BM || {});
'use strict';

/**
 * Загрузчик скриптов
 */

(function (window, document, BM) {
  var tools = BM.tools = BM.tools || {},
      config = BM.config = BM.config || {};

  var loadScripts = function loadScripts(templateType) {
    var loadConfig = config.loadScriptsConfig;
    if (loadConfig.hasOwnProperty(templateType)) {
      loadConfig[templateType]();
    } else {
      loadConfig['default']();
    }
  };

  tools.loadScripts = loadScripts;
})(undefined, undefined.document, undefined.BM = undefined.BM || {});
'use strict';

(function (window, document, BM, $) {
  'use strict';

  var tools = BM.tools = BM.tools || {},
      config = BM.config = BM.config || {},
      dataScripts = document.body.getAttribute('data-scripts'),
      templateType = dataScripts || config.mainConfig.action + '-' + config.mainConfig.scriptTemplate;

  if (true || config.debug) {
    console.enable();
  }

  $(function () {
    tools.loadScripts(templateType);
  });
})(undefined, undefined.document, undefined.BM || {}, undefined.jQuery);