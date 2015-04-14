(function(window, modules, $, BM){

  modules.define(
    'FormItemOrder',
    [
      'extend',
      'baseView',
      'FormItemSelectGrind',
      'ButtonNumber'
    ],
    function(
      provide,
      extend,
      BaseView,
      FormItemSelectGrind,
      ButtonNumber
    ) {

    var FormItemOrder = extend(BaseView),

        $class = FormItemOrder,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this._formSelectGrind     = null;
        this._buttonNumber250     = null;
        this._buttonNumber500     = null;
        this._buttonNumber1kg     = null;

        this.$elemFormSelectGrind = this.$elem.find('@bm-form-select-grind');
        this.$elemButtonNumber250 = this.$elem.find('@bm-button-number-250');
        this.$elemButtonNumber500 = this.$elem.find('@bm-button-number-500');
        this.$elemButtonNumber1kg = this.$elem.find('@bm-button-number-1kg');

        this._initFormSelectGrind();
        this._initButtonsNumber();
      },

      _initFormSelectGrind : function() {
        if (BM.tools.isNull(this._formSelectGrind)) {
          this._formSelectGrind = new FormItemSelectGrind({
            element: this.$elemFormSelectGrind
          });
          this._formSelectGrind.on('change', function(value) {
            this._onFormSelectGrindChange(value);
          }.bind(this));
        }
      },

      _initButtonsNumber : function() {
        if (BM.tools.isNull(this._buttonNumber250)) {
          this._buttonNumber250 = new ButtonNumber({
            element: this.$elemButtonNumber250
          });
          this._buttonNumber250.on('change', function(value) {
            this._onButtonNumberChange('250', value);
          }.bind(this));
        }
        if (BM.tools.isNull(this._buttonNumber500)) {
          this._buttonNumber500 = new ButtonNumber({
            element: this.$elemButtonNumber500
          });
          this._buttonNumber500.on('change', function(value) {
            this._onButtonNumberChange('500', value);
          }.bind(this));
        }
        if (BM.tools.isNull(this._buttonNumber1kg)) {
          this._buttonNumber1kg = new ButtonNumber({
            element: this.$elemButtonNumber1kg
          });
          this._buttonNumber1kg.on('change', function(value) {
            this._onButtonNumberChange('1kg', value);
          }.bind(this));
        }
      },

      _onFormSelectGrindChange : function(value) {

      },

      _onButtonNumberChange : function(kind, value) {
        console.log(kind, value);
      }

    });

    provide(FormItemOrder);

  });

}(this, this.modules, this.jQuery, this.BM));