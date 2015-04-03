(function(window, modules, $){

    modules.define('moduleSurveyControls', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var SurveyControls = extend(PubSub),

            $class = SurveyControls,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem              = config.element;
                this.$elemButtonComment = this.$elem.find('@b-survey-controls-button-comment');
                this.$elemButtonLike    = this.$elem.find('@b-survey-controls-button-like');
                this.$elemButtonBest    = this.$elem.find('@b-survey-controls-button-best');
                this.$elemButtonNext    = this.$elem.find('@b-survey-controls-button-next');

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButtonComment.on('click', function() {
                    me._notify('click-comment');
                });
                this.$elemButtonLike.on('click', function() {
                    me._notify('click-like');
                });
                this.$elemButtonBest.on('click', function() {
                    me._notify('click-best');
                });
                this.$elemButtonNext.on('click', function() {
                    me._notify('click-next');
                });
            }

        });

        provide(SurveyControls);

    });

}(this, this.modules, this.jQuery));