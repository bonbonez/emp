(function(window, modules, $, BM){

  modules.define(
    'ButtonNumber',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

    var ControlButtonNumber = extend(BaseView),

        $class = ControlButtonNumber,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._value          = 0;

        this.$elemInputValue = this.$elem.find('@bm-button-number-input-value');
        this.$elemMinus      = this.$elem.find('@bm-button-number-minus');
        this.$elemPlus       = this.$elem.find('@bm-button-number-plus');
        this.$elemValue      = this.$elem.find('@bm-button-number-value');

        this._bindEvents();
        this.update();
      },

      _bindEvents : function() {
        this.$elemMinus.on(BM.helper.event.clickName(), function(event) {
          this._onMinusClick(event);
        }.bind(this));

        this.$elemPlus.on(BM.helper.event.clickName(), function(event) {
          this._onPlusClick(event);
        }.bind(this))
      },

      _onMinusClick : function(event) {
        this._decValue();
      },

      _onPlusClick : function(event) {
        this._incValue();
      },

      _incValue : function() {
        this.setValue(this._value + 1);
      },

      _decValue : function() {
        this.setValue(Math.max(0, this._value - 1));
      },

      setValue : function(value) {
        if (BM.tools.isNumber(value) && value >= 0) {
          this._value = value;
          this.update();
          this._notify('change', this._value);
        }
      },

      update : function() {
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

}(this, this.modules, this.jQuery, this.BM));