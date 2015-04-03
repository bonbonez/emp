(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.history = BM.helper.history || {};


    BM.tools.mixin(BM.helper.history, {

        getPopupQuoteState : function(login, uuid) {
            return {
                type  : 'popupQuote',
                uuid  : uuid,
                login : login
            };
        }

    });


}(this, this.BM));