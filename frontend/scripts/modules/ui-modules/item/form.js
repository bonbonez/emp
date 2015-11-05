(function(window, modules, $, BM){

  modules.define(
    'ItemFormOrder',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

    var ItemFormOrder = extend(BaseView),

        $class = ItemFormOrder,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.el) {
          return;
        }

        this._amount = null;
        this._grind  = null;

        this.$amountItems = this.el.find('@bm-item-form-order-amount-item');
        this.$grindItems  = this.el.find('@bm-item-form-order-grind-item');
        this.$buttonAdd   = this.el.find('@bm-item-form-order-button-add');

        this._updateAmount();
        this._updateGrind();
        this._updateButton();

        this._bindEvents();
      },

      _bindEvents : function() {
        var self      = this,
            clickName = BM.helper.event.clickName();

        this.$buttonAdd.on(clickName, function(event) {
          this._onButtonAddClick(event);
        }.bind(this));
        this.$amountItems.on(clickName, function(event) {
          this._onAmountItemClick(event);
        }.bind(this));
        this.$grindItems.on(clickName, function(event) {
          this._onGrindItemClick(event);
        }.bind(this))
      },

      _onButtonAddClick : function() {
        this._notifyAdd();
      },

      _onAmountItemClick : function(event) {
        var $this = $(event.target);
        while ($this.filter('[role=bm-item-form-order-amount-item]').length < 1) {
          $this = $this.parent();
        }

        this.$amountItems.removeClass('m-selected');
        $this.addClass('m-selected');

        this._updateButton();
        this._updateAmount();
      },

      _onGrindItemClick : function(event) {
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

      setPrices : function(pricesArr) {
        pricesArr.forEach(function(price){
          var $amountItem = this.$amountItems.filter(function(){return $(this).data('amount') == price.amount}),
              $itemPrice  = $amountItem.find('@bm-item-form-order-amount-item-price');

          $itemPrice.html(
            price.value + $itemPrice.data('text')
          );
        }.bind(this))
      },

      _updateAmount : function() {
        this._amount = this._getSelectedItemAmount().data('amount');
      },

      _updateGrind : function() {
        this._grind = this.$grindItems.filter('.m-selected').last().data('grind');
      },

      _getSelectedItemAmount : function() {
        return this.$amountItems.filter('.m-selected').last();
      },

      _getSelectedItemGrind : function() {
        return this.$grindItems.filter('.m-selected').last();
      },

      _updateButton : function() {
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

      _notifyAdd : function() {
        var obj = {
          amount : this._amount,
          grind : this._grind
        };

        this._notify('add', obj);
      }

    });

    provide(ItemFormOrder);

  });

}(this, this.modules, this.jQuery, this.BM));