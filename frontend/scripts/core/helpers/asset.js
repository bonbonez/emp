(function(window) {

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.asset = BM.helper.asset || {};


  BM.tools.mixin(BM.helper.asset, {

    path: function (path) {
      if (path) {
        /*if (BM.config.isProduction()) {
         return 'https://bookmate.com' + path;
         } else {
         return path;
         }*/
        return path;
      }
      return '';
    }

  });

}(this));