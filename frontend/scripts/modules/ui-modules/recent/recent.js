(function(window, modules, $, BM){

    modules.define('BlockRecent', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var BlockRecent = extend(PubSub),

            $class = BlockRecent,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem = config.element;
                this.$elemButtonClose = this.$elem.find('@b-block-recent-button-close');

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemButtonClose.on('click', function() {
                    me._onButtonCloseClick();
                });
            },

            _onButtonCloseClick : function() {
                this.hide();
                this.sendRequestClearRecent();
            },

            sendRequestClearRecent : function() {
                //var me = this;
                $.ajax({
                    url: '/api/items/recent/clear',
                    type: 'post'
                });
            },

            _setFixedHeight : function() {

            },

            hide : function() {
                this.$elem.height(this.$elem.height());
                this.$elem.attr('data-visible', 'false');
                setTimeout(function(){
                    this.$elem.height(0);
                }.bind(this), 400);
            },

            destroy : function() {

            }

        });

        provide(BlockRecent);

    });

}(this, this.modules, this.jQuery, this.BM));