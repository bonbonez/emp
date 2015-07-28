(function(window, modules, $, BM){

  modules.define(
    'ItemSpecsItem',
    [
      'extend',
      'baseView'
    ],
    function(
      provide,
      extend,
      BaseView
    ) {

      var ItemSpecsItem = extend(BaseView),

        $class = ItemSpecsItem,
        $super = $class.superclass;

      BM.tools.mixin($class.prototype, {

        initialize : function(config) {
          $super.initialize.apply(this, arguments);

          if (!this.el) {
            return;
          }

          this.$label = this.el.find('@bm-item-specs-item-label');
          this.$value = this.el.find('@bm-item-specs-item-value');
          this.$hint  = this.el.find('@bm-item-specs-item-hint');

          this._timeoutShowHint = null;

          this._config = BM.tools.mixin({}, config);

          this._bindEvents();
          this.render();
        },

        _bindEvents : function() {
          if (BM.tools.client.isTouch()) {
            this._onLabelTap();
          } else {
            this.$label.on('mouseover', function(event) {
              this._onLabelMouseOver();
            }.bind(this));
            this.$label.on('mouseout', function(event) {
              this._onLabelMouseOut();
            }.bind(this));
          }
        },

        _onLabelMouseOver : function() {
          if (!this._isHintAvailable()) {
            return;
          }

          this._timeoutShowHint = setTimeout(function(){
            this._showHint();
          }.bind(this), 300);
        },

        _onLabelMouseOut : function() {
          if (!BM.tools.isNull(this._timeoutShowHint)) {
            clearTimeout(this._timeoutShowHint);
            this._timeoutShowHint = null;
          }
          this._hideHint();
        },

        _onLabelTap : function() {
          if (!this._isHintAvailable()) {
            return;
          }

          this.$label.on('tap', function(event){
            this._toggleHint();
          }.bind(this))
        },

        _toggleHint : function() {
          if (this._isHintVisible()) {
            this._hideHint();
          } else {
            this._showHint();
          }
        },

        _showHint : function() {
          this.el.addClass('m-hint-visible');
        },

        _hideHint : function() {
          this.el.removeClass('m-hint-visible');
        },

        _isHintVisible : function() {
          return this.el.hasClass('m-hint-visible');
        },

        _isHintAvailable : function() {
          return this._config && this._config.data.description && this._config.options && this._config.options.hint === true;
        },

        render : function() {
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

        _getTemplateName : function() {
          return 'bm-item-specs-all-item-template';
        }
      });

      provide(ItemSpecsItem);

    });

}(this, this.modules, this.jQuery, this.BM));