(function(window){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.misc = BM.helper.misc || {};

  BM.tools.mixin(BM.helper.misc, {

    getTextAmount : function(value, options) {
      return value + ' грамм'
    },

    getTextPrice : function(value, options) {
      var currency = ' рублей';
      if (options && options.short) {
        currency = ' руб.';
      }
      return value + currency;
    }

  });

}(this));