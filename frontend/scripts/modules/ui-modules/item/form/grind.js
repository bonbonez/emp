(function(window, modules, $, BM){

  modules.define(
    'FormItemSelectGrind',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

    var FormItemSelectGrind = extend(BaseView),

        $class = FormItemSelectGrind,
        $super = $class.superclass;

    BM.tools.mixin($class.prototype, {

      initialize : function() {
        $super.initialize.apply(this, arguments);

        if (!this.$elem) {
          return;
        }

        this.$elemsWithUniqueId    = this.$elem.find('@bm-form-unique-element');
        this.$elemsOptionsViaGrind = this.$elem.find('@bm-form-grind-option-via-grind');
        this.$elemsBrewingMethods  = this.$elem.find('@bm-brewing-method');

        this.$elemViaTypeWrapper   = this.$elem.find('@bm-form-select-grind-via-type-wrapper');

        this._setUniqueIds();
        this._bindEvents();
        window.o = this;
      },

      _bindEvents : function() {
        this.$elemsOptionsViaGrind.on('change', function(event) {
          this._onOptionViaGrindChange(event);
        }.bind(this));
        this.$elemsBrewingMethods.on(BM.helper.event.clickName(), function(event) {
          this._onBrewingMethodClick(event);
        }.bind(this));
      },

      _onOptionViaGrindChange : function(event) {
        this._setSelectViaGrindStateBlur(false);
        this._unselectViaMethodItems();
        this._notify('change', this.$elemsOptionsViaGrind.filter(':checked').val());
      },

      _onBrewingMethodClick : function(event) {
        var targetElement = $(event.target);
        if (!targetElement.hasClass('bm-brewing-method')) {
          targetElement = targetElement.parent();
        }
        targetElement.addClass('m-selected');
        this.$elemsBrewingMethods.not(targetElement).removeClass('m-selected');
        this._setSelectViaGrindStateBlur(true);
        this._notify('change', targetElement.data('name'));
      },

      _setUniqueIds : function() {
        var postfix = this.getInstanceId();

        this.$elemsWithUniqueId.each(function() {
          var $this = $(this);
          if ($this.prop('tagName') === 'LABEL') {
            $this.attr('for', $this.attr('for') + '-' + postfix);
          } else if ($this.prop('tagName') === 'INPUT') {
            $this.attr('id', $this.attr('id') + '-' + postfix);
            $this.attr('name', $this.attr('name') + '-' + postfix);
          }
        });
      },

      _setSelectViaGrindStateBlur : function(bool) {
        if (bool) {
          this.$elemViaTypeWrapper.addClass('m-blur');
        } else {
          this.$elemViaTypeWrapper.removeClass('m-blur');
        }
      },

      _unselectViaMethodItems : function() {
        this.$elemsBrewingMethods.removeClass('m-selected');
      }

    });

    provide(FormItemSelectGrind);

  });

}(this, this.modules, this.jQuery, this.BM));