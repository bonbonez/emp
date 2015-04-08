var $__cart_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "cart/init.js";
  (function(window, modules, $, radio) {
    modules.define('pageCartInit', ['pageCartItem', 'CartProcessor'], function(provide, CartItem, cart) {
      var $elemPageCart = $('@b-page-cart');
      $('@b-cart-item').each(function() {
        var $this = $(this);
        new CartItem({element: $this});
      });
      cart.on('update', function() {
        if (cart.getTotalItems() < 1) {
          $elemPageCart.attr('data-cart-empty', 'true');
        }
      });
      provide();
    });
  }(this, this.modules, this.jQuery, this.radio));
  return {};
}).call(Reflect.global);

var $__cart_47_item_46_js__ = (function() {
  "use strict";
  var __moduleName = "cart/item.js";
  (function(window, modules, $) {
    modules.define('pageCartItem', ['basePubSub', 'extend'], function(provide, PubSub, extend) {
      var CartItem = extend(PubSub),
          $class = CartItem,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          this.$elem = config.element;
          this.$elemButtonRemove = this.$elem.find('@b-cart-item-button-remove');
          this.$elemButtonMinus = this.$elem.find('@b-cart-item-button-minus');
          this.$elemButtonPlus = this.$elem.find('@b-cart-item-button-plus');
          this.$elemAmount = this.$elem.find('@b-cart-item-amount');
          this.$elemPrice = this.$elem.find('@b-cart-item-price');
          this.$elemPriceTotal = this.$elem.find('@b-cart-item-price-total');
          this._config = {item: {id: null}};
          this._parseConfig();
          this._updateLayout();
          this._setupEvents();
        },
        _parseConfig: function() {
          try {
            this._config = JSON.parse(this.$elem.attr('data-config'));
          } catch (e) {}
        },
        _setupEvents: function() {
          var me = this;
          this.$elemButtonRemove.on('click', function() {
            me._onButtonCloseClick();
          });
          this.$elemButtonMinus.on('click', function() {
            me._onButtonMinusClick();
          });
          this.$elemButtonPlus.on('click', function() {
            me._onButtonPlusClick();
          });
        },
        _onButtonCloseClick: function() {
          var me = this;
          this._setStateWait(true);
          $.ajax({
            url: '/api/cart/item/remove',
            type: 'post',
            dataType: 'json',
            data: {item: {id: this._config.item.id}},
            success: function(data) {
              setTimeout(function() {
                me._onRequestItemRemoveSuccess(data);
              }, 300);
            },
            error: function() {
              setTimeout(function() {
                me._onRequestAddToCartError();
              }, 300);
            }
          });
        },
        _onButtonMinusClick: function() {
          if (this._getCurrentAmount() > 1) {
            this._sendRequestDecItem();
          }
        },
        _sendRequestDecItem: function() {
          var me = this;
          $.ajax({
            url: '/api/cart/item/dec',
            type: 'post',
            dataType: 'json',
            data: {item: {id: this._config.item.id}},
            success: function(data) {
              setTimeout(function() {
                me._onRequestDecItemSuccess();
                radio('b-cart-update').broadcast(data);
              }, 300);
            },
            error: function() {
              me._onRequestDecItemError();
            }
          });
        },
        _onRequestDecItemSuccess: function() {
          this._setStateWait(false);
          this._decItemAmount();
          this._updatePrice();
        },
        _onRequestDecItemError: function() {
          this._setStateWait(false);
        },
        _onButtonPlusClick: function() {
          this._sendRequestIncItem();
        },
        _sendRequestIncItem: function() {
          var me = this;
          $.ajax({
            url: '/api/cart/item/inc',
            type: 'post',
            dataType: 'json',
            data: {item: {id: this._config.item.id}},
            success: function(data) {
              setTimeout(function() {
                me._onRequestIncItemSuccess(data);
              }, 300);
            },
            error: function() {
              me._onRequestIncItemError();
            }
          });
        },
        _onRequestIncItemSuccess: function(data) {
          this._setStateWait(false);
          this._incItemAmount();
          this._updatePrice();
          radio('b-cart-update').broadcast(data);
        },
        _onRequestIncItemError: function() {
          this._setStateWait(false);
        },
        _onRequestItemRemoveSuccess: function(data) {
          var me = this;
          setTimeout(function() {
            me.hide();
            radio('b-cart-update').broadcast(data);
          }.bind(this), 300);
        },
        _onRequestItemRemoveError: function() {
          setTimeout(function() {
            this._setStateWait(false);
          }.bind(this), 300);
        },
        _slideOut: function(callback) {},
        hide: function() {
          this.$elem.attr('data-visible', 'false');
        },
        _updateLayout: function() {},
        _setStateWait: function(bool) {
          if (bool) {
            this.$elem.attr('data-wait', 'true');
          } else {
            this.$elem.attr('data-wait', 'fasle');
          }
        },
        _getCurrentAmount: function() {
          var amount = this.$elemAmount.html();
          amount = parseInt(amount, 10);
          return amount;
        },
        _incItemAmount: function() {
          var amount = this._getCurrentAmount();
          this._showButtonMinus();
          return this.$elemAmount.html(amount + 1);
        },
        _decItemAmount: function() {
          var amount = this._getCurrentAmount();
          if (amount <= 2) {
            this._hideButtonMinus();
          }
          return this.$elemAmount.html(amount - 1);
        },
        _showButtonMinus: function() {
          this.$elemButtonMinus.attr('data-visible', 'true');
        },
        _hideButtonMinus: function() {
          this.$elemButtonMinus.attr('data-visible', 'false');
        },
        _updatePrice: function() {
          var amount = this._getCurrentAmount();
          if (amount > 1) {
            this._showPriceTotal();
          } else {
            this._hidePriceTotal();
          }
        },
        _showPriceTotal: function() {
          this.$elemPriceTotal.html(this._getCurrentAmount() * this._config.item.price);
          this.$elemPrice.attr('data-total-visible', 'true');
        },
        _hidePriceTotal: function() {
          this.$elemPrice.attr('data-total-visible', 'false');
        },
        destroy: function() {
          $super.destroy.apply(this, arguments);
        }
      });
      provide(CartItem);
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__catalogue_47_background_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/background.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueBackground', ['extend', 'baseView'], function(provide, extend, BaseView) {
      var CatalogueBackground = extend(BaseView),
          $class = CatalogueBackground,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return ;
          }
          this._items = {
            first: this._getItem('first'),
            second: this._getItem('second')
          };
          this._baseHeight = null;
          this._currentItem = this._items.first;
          this._lastOffsetValue = null;
          this._lastCalculatedOffsetValue = null;
          window.b = this;
          this._updateBaseHeightValue();
          this._bindEvents();
        },
        _getItem: function(name) {
          var $elem = this.$elem.find('[data-item=' + name + ']');
          return {
            elem: $elem,
            size: $elem.data('size'),
            height: $elem.height()
          };
        },
        _bindEvents: function() {
          $window.on('resize', function() {
            this._updateBaseHeightValue();
            this._updateCurrentItemOffset();
          }.bind(this));
        },
        setCurrentItem: function(itemName) {
          if (itemName === this._currentItem.elem.data('item')) {
            return ;
          }
          var item = this._getItem(itemName);
          if (item.elem.length < 1) {
            return ;
          }
          item.elem.prependTo(this.$elem);
          item.elem.addClass('m-visible');
          this._currentItem.elem.removeClass('m-visible');
          this._currentItem = item;
        },
        _getCurrentItem: function() {},
        setProgress: function(value) {
          if (!BM.tools.isNumber(value)) {
            return ;
          }
          console.log('imhere');
          value = Math.min(100, Math.max(0, value));
          this._setCurrentItemOffset(value);
        },
        _setCurrentItemOffset: function(value) {
          this._lastOffsetValue = value;
          var offset = (this._currentItem.height - this._baseHeight) / 100 * value * -1;
          window.requestAnimationFrame(function() {
            this._currentItem.elem.css({'transform': 'translateY(' + offset + 'px)'});
          }.bind(this));
        },
        _updateBaseHeightValue: function() {
          this._baseHeight = this.$elem.height();
        },
        _updateCurrentItemOffset: function() {
          if (!BM.tools.isNull(this._lastOffsetValue)) {
            this._setCurrentItemOffset(this._lastOffsetValue);
          }
        }
      });
      provide(CatalogueBackground);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__catalogue_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "catalogue/init.js";
  (function(window, modules, $, BM) {
    modules.define('CatalogueInit', ['extend', 'baseView', 'Paralax', 'CatalogueBackground'], function(provide, extend, BaseView, Paralax, Background) {
      var CatalogueInit = extend(BaseView),
          $class = CatalogueInit,
          $super = $class.superclass,
          $window = $(window);
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          if (!this.$elem) {
            return ;
          }
          this._backgroundHandler = null;
          this._timeoutUpdateBackground = null;
          this.$elemBackground = this.$elem.find('@bm-catalogue-background');
          this._groupes = [this.$elemGroupClassic = this.$elem.find('@bm-catalogue-item-group-classic'), this.$elemGroupAroma = this.$elem.find('@bm-catalogue-item-group-aroma')];
          this._groupesRanges = [];
          this._saveGroupsRanges();
          this._initBackground();
          this._initParalax();
          this._bindEvents();
        },
        _bindEvents: function() {
          $(window).on('resize', function() {
            this._saveGroupsRanges();
          }.bind(this));
        },
        _initBackground: function() {
          if (BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler = new Background({element: this.$elemBackground});
          }
        },
        _initParalax: function() {
          this._timeoutUpdateBackground = setTimeout(function updateBackground() {
            this._updateBackground();
            this._timeoutUpdateBackground = setTimeout(updateBackground.bind(this), 25);
          }.bind(this), 250);
        },
        _saveGroupsRanges: function() {
          var previousTopRange = 0;
          this._groupesRanges.length = 0;
          this._groupesRanges = [];
          this._groupes.forEach(function($group) {
            var bottomRange = $group.offset().top + $group.height();
            this._groupesRanges.push({
              elem: $group,
              height: $group.height(),
              top: previousTopRange,
              bottom: bottomRange
            });
            previousTopRange = bottomRange + 1;
          }.bind(this));
          console.log(this._groupesRanges);
        },
        _updateBackground: function() {
          var range = this._getCurrentRange();
          if (BM.tools.isNull(range)) {
            return ;
          }
          this._updateParallax(range);
          this._updateImage(range.elem);
        },
        _updateParallax: function(range) {
          var scrollTop = $window.scrollTop(),
              scrollProgress = parseInt(((scrollTop - range.top) / (range.bottom - range.top) * 100).toFixed(0), 10);
          if (!BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler.setProgress(scrollProgress);
          }
        },
        _updateImage: function($group) {
          if (!BM.tools.isNull(this._backgroundHandler)) {
            this._backgroundHandler.setCurrentItem($group.data('n'));
          }
        },
        _getCurrentGroupByRange: function() {
          var range = this._getCurrentRange();
          if (!BM.tools.isNull(range)) {
            return range.elem;
          }
        },
        _getCurrentRange: function() {
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
      new CatalogueInit({element: $(document.body).find('@bm-catalogue-index')});
      provide(CatalogueInit);
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_init_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/init.js";
  (function(window, modules, $) {
    modules.define('beforeUIModulesInit', ['initCartProcessor'], function(provide) {
      provide();
    });
    modules.define('ui-modules', ['beforeUIModulesInit'], function(provide) {
      if (BM.tools.client.isTouch()) {
        $('body').addClass('m-touch');
      } else {
        $('body').addClass('m-desktop');
      }
      provide();
    });
  }(this, this.modules, this.jQuery));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_cart_47_cart_45_header_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/cart/cart-header.js";
  (function(window, modules, $, BM) {
    modules.define('HeaderCart', ['basePubSub', 'extend', 'CartProcessor'], function(provide, PubSub, extend, cart) {
      var HeaderCart = extend(PubSub),
          $class = HeaderCart,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          if (!config || !config.element) {
            return ;
          }
          this.$elem = config.element;
          this.$elemCounter = this.$elem.find('@b-header-cart-counter');
          this.$elemCounterText = this.$elem.find('@b-header-cart-counter-text');
          this.$elemButtonOrder = this.$elem.find('@b-header-cart-button-order');
          this._setupEvents();
          this._updateData();
        },
        _setupEvents: function() {
          var me = this;
          cart.on('update', function() {
            me._updateData();
          });
        },
        _showCounter: function() {
          this.$elemCounter.attr('data-visible', 'true');
        },
        _hideCounter: function() {
          this.$elemCounter.attr('data-visible', 'false');
        },
        _updateData: function() {
          this._updateDataCounter();
        },
        _updateDataCounter: function() {
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
        _showButtonOrder: function() {
          this.$elemButtonOrder.attr('data-visible', 'true');
        },
        _hideButtonOrder: function() {
          this.$elemButtonOrder.attr('data-visible', 'false');
        },
        _updateCounterText: function() {
          var amount = cart.getTotalItems();
          this.$elemCounterText.html(amount);
        },
        destroy: function() {
          $super.destroy.apply(this, arguments);
        }
      });
      provide(HeaderCart);
    });
    modules.define('initCartHeader', ['HeaderCart'], function(provide, HeaderCart) {
      var headerCart = new HeaderCart({element: $('@b-header-cart')});
      provide();
    });
  }(this, this.modules, this.jQuery, this.BM));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_cart_47_cart_45_processor_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/cart/cart-processor.js";
  (function(window, modules, $, radio) {
    modules.define('CartProcessorClass', ['basePubSub', 'extend'], function(provide, PubSub, extend) {
      var CartProcessor = extend(PubSub),
          $class = CartProcessor,
          $super = $class.superclass;
      BM.tools.mixin($class.prototype, {
        initialize: function() {
          $super.initialize.apply(this, arguments);
          this._data = {items: []};
        },
        setData: function(data) {
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
        getData: function() {
          return this._data;
        },
        getTotalItems: function() {
          var total = 0;
          this._data.items.forEach(function(elem) {
            total += elem.amount;
          });
          return total;
        },
        destroy: function() {
          $super.destroy.apply(this, arguments);
        }
      });
      provide(CartProcessor);
    });
    modules.define('CartProcessor', ['CartProcessorClass'], function(provide, CartProcessor) {
      var $body = $(document.body),
          cart = new CartProcessor();
      try {
        cart.setData(JSON.parse($body.attr('data-cart-config')));
      } catch (e) {}
      provide(cart);
    });
    modules.define('initCartProcessor', ['CartProcessor'], function(provide, cart) {
      radio('b-cart-update').subscribe(function(data) {
        cart.setData(data);
      });
      provide();
    });
  }(this, this.modules, this.jQuery, this.radio));
  return {};
}).call(Reflect.global);

var $__ui_45_modules_47_paralax_47_paralax_46_js__ = (function() {
  "use strict";
  var __moduleName = "ui-modules/paralax/paralax.js";
  (function(window, modules, $, BM) {
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
        initialize: function(config) {
          $super.initialize.apply(this, arguments);
          this._speed = 0.5;
          this._steps = [];
          this._applyConfig();
        },
        _applyConfig: function() {
          if (BM.tools.isPresent(config)) {
            if (BM.tools.isPresent(config.speed)) {
              this._speed = config.speed;
            }
            if (BM.tools.isPresent(config.steps)) {
              this._parseSteps(config.steps);
            }
          }
        },
        _parseSteps: function(steps) {
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
  return {};
}).call(Reflect.global);

var $__loadScriptsConfig_46_js__ = (function() {
  "use strict";
  var __moduleName = "loadScriptsConfig.js";
  (function(window, document, modules, BM) {
    var config = BM.config || {},
        mainConfig = document.body.getAttribute('data-config'),
        parsedMainConfig = JSON.parse(mainConfig) || {},
        assetHost = parsedMainConfig.assetHost || '';
    var getWithVersion = function getWithVersion(filename) {
      var debug = config.debug || parsedMainConfig.debug || false,
          version = parsedMainConfig.version || new Date();
      return filename += '?t=' + version;
    };
    config.loadScriptsConfig = {
      'default': function() {
        modules.require('ui-modules');
      },
      'catalogue-index': function() {
        modules.require('ui-modules');
        modules.require('CatalogueInit');
      }
    };
  }(this, this.document, this.modules, this.BM = this.BM || {}));
  return {};
}).call(Reflect.global);

var $__loadScripts_46_js__ = (function() {
  "use strict";
  var __moduleName = "loadScripts.js";
  (function(window, document, BM) {
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
  }(this, this.document, this.BM = this.BM || {}));
  return {};
}).call(Reflect.global);

var $__initApp_46_js__ = (function() {
  "use strict";
  var __moduleName = "initApp.js";
  (function(window, document, BM, $) {
    'use strict';
    var tools = BM.tools = BM.tools || {},
        config = BM.config = BM.config || {},
        dataScripts = document.body.getAttribute('data-scripts'),
        templateType = dataScripts || config.mainConfig.action + '-' + config.mainConfig.scriptTemplate;
    if (true || config.debug) {
      console.enable();
    }
    $(function() {
      tools.loadScripts(templateType);
    });
  }(this, this.document, this.BM || {}, this.jQuery));
  return {};
}).call(Reflect.global);
