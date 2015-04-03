(function(window, modules, $){

    modules.define('moduleSurveyRequestHandler', ['basePubSub', 'extend'], function(provide, PubSub, extend){

        var RequestHandler = extend(PubSub),

            $class = RequestHandler,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);
                this._config = this._parseConfig();
            },

            _parseConfig : function() {
                try {
                    this._config = JSON.parse($(document.body).attr('data-config'));
                } catch (e) { }
            },

            //sendLike

            like : function(success, error) {
                return this._sendRequestNext('like', success, error);
            },

            best : function(success, error) {
                return this._sendRequestNext('best', success, error);
            },

            next : function(success, error) {
                return this._sendRequestNext('next', success, error);
            },

            _sendRequestNext : function(action, success, error) {
                $.ajax({
                    url: '/api/survey/next',
                    dataType: 'json',
                    type: 'post',
                    data: {
                        'item_action' : action
                    },
                    success : success,
                    error : error
                });
            }

        });



        provide(new RequestHandler());

    });

}(this, this.modules, this.jQuery));