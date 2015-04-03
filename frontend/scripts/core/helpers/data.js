(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.data = BM.helper.data || {};


  BM.tools.mixin(BM.helper.data, {
    isValidUUID : function(uuid) {
      if (BM.tools.isString(uuid)) {
        if (uuid.length < 6 || uuid.length > 10) {
          return false;
        }
        if (['recent', 'all', 'finished', 'not_finished', 'uploads', 'quotes'].indexOf(uuid) !== -1) {
          return false;
        }
        return true;
      }
      return false;
    }
  });


}(this, this.BM));
