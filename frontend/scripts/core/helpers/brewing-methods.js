(function(window, BM, $, radio, modules){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.brewingMethods = {};

  modules.require(['basePubSub', 'extend'], function(PubSub, extend){

    BM.helper.brewingMethods = new PubSub();

    var brewingMethods = null;


    BM.tools.mixin(BM.helper.brewingMethods, {

      fetch() {
        var callbackSuccess,
            callbackError,
            forced;

        if (!BM.tools.isFunction(arguments[0])) {
          return;
        } else {
          callbackSuccess = arguments[0];

          if (BM.tools.isFunction(arguments[1])) {
            callbackError = arguments[1];
          } else {
            forced = arguments[1];
          }
        }

        if (!BM.tools.isNull(brewingMethods) && forced !== true) {
          callbackSuccess(brewingMethods);
          return;
        }

        $.ajax({
          url: '/api/brewing_methods',
          type: 'get',
          dataType: 'json',
          success : function(data) {
            brewingMethods = data;
            BM.helper.brewingMethods._notify('prices-fetched');
            if (BM.tools.isFunction(callbackSuccess)) {
              callbackSuccess(data);
            }
          },
          error : function() {
            if (callbackError) {
              callbackError();
            }
          }
        });
      }

    });

  });


}(this, this.BM, this.jQuery, this.radio, this.modules));
