(function(window, BM){

  BM = window.BM || {};
  BM.helper = BM.helper || {};
  BM.helper.browser = BM.helper.browser || {};


  BM.tools.mixin(BM.helper.browser, {

    triggerRerender : function() {
      try {
        document.body.offsetHeight = document.body.offsetHeight;
      } catch (e) {}
    }

  });

}(this, this.BM));