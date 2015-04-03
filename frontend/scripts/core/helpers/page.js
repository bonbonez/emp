(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.page = BM.helper.page || {};


  BM.tools.mixin(BM.helper.page, {

    isMyRecentPage : function() {
      return window.location.pathname === '/' + BM.user.getLogin() + '/recent';
    },

    isOthersRecentPage : function() {
      return (window.location.pathname === '/' + BM.user.getViewingUserLogin() + '/recent') && BM.user.getLogin() !== BM.user.getViewingUserLogin();
    }

  });

}(this, this.BM));