(function(window, BM, $, radio, modules){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.grind = {};

  modules.require(['basePubSub', 'extend'], function(PubSub, extend){

    BM.helper.grind = new PubSub();

    var grindTypes = null;


    BM.tools.mixin(BM.helper.grind, {

      fetchTypes() {
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

        if (!BM.tools.isNull(grindTypes) && forced !== true) {
          callbackSuccess(grindTypes);
          return;
        }

        $.ajax({
          url: '/api/grind_types',
          type: 'get',
          dataType: 'json',
          success : function(data) {
            grindTypes = data;
            BM.helper.grind._notify('prices-fetched');
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
      },

      getTypeMeta(kind) {
        if (!grindTypes) {
          return null;
        }
        var res = _.find(grindTypes, (g) => {return g.kind === kind});
        return res;
      },

      getGrindTextFull(kind) {
        var grindMeta = BM.helper.grind.getTypeMeta(kind);
        return grindMeta.label_full.toLowerCase();
      }

    });

  });


}(this, this.BM, this.jQuery, this.radio, this.modules));
