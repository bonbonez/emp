(function(window, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.env = BM.helper.env || {};


    BM.tools.mixin(BM.helper.env, {

        isStaging : function() {
            return BM.config.mainConfig.environment === 'staging';
        },

        isDevelopment : function() {
            return BM.config.mainConfig.environment === 'development';
        },

        isProduction : function() {
            return BM.config.mainConfig.environment === 'production';
        },

        getEnvironment : function() {
            return BM.config.mainConfig.environment;
        }

    });


}(this, this.BM));