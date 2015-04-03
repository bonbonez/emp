(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.country = BM.helper.country || {};


    BM.tools.mixin(BM.helper.country, {

        isSingapore : function() {
            return !BM.tools.isNull(BM.config.mainConfig.country) && BM.config.mainConfig.country === 'sg';
        },

        isEstonia : function() {
            return !BM.tools.isNull(BM.config.mainConfig.country) && BM.config.mainConfig.country === 'ee';
        }

    });


}(this, this.BM));