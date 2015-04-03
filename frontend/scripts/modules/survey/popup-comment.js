(function(window, modules, $){

    modules.define('modulePopupComment', ['popupBaseClass', 'extend'], function(provide, PopupBase, extend){

        var PopupComment = extend(PopupBase),

            $class = PopupComment,
            $super = $class.superclass,

            templateName = 'b-popup-comment-template';

        BM.tools.mixin($class.prototype, {

            initialize : function() {
                $super.initialize.call(this, {
                    className   : 'b-popup-comment',
                    useTemplate : true
                });

                this.$elemTextarea = this._element.find('@b-popup-comment-textarea');
                this.$elemSubmit   = this._element.find('@b-popup-comment-submit');
                //console.log(this.$elemSubmit);

                this.bindEvents();
            },

            bindEvents : function() {
                var me = this;
                this.$elemSubmit.on('click', function() {
                    me._onFormSubmit();
                });
            },

            _onFormSubmit : function() {
                if (this.$elemTextarea.length > 0) {
                    this._disableForm();
                    this._sendRequest();
                }
            },

            _sendRequest : function() {
                var me = this;
                $.ajax({
                    url: '/api/survey/comment',
                    dataType : 'json',
                    type: 'post',
                    data: {
                        comment: this.$elemTextarea.val()
                    },
                    success: function(data) {
                        me._showStateSuccess();
                    },
                    error: function() {
                        me._enableForm();
                    }
                });
            },

            _disableForm : function() {
                this.$elemTextarea.attr('disabled', 'disabled');
                this.$elemSubmit.attr('disabled', 'disabled');
                this.$elemSubmit.attr('data-wait', 'true');
            },

            _enableForm : function() {
                this.$elemTextarea.removeAttr('disabled');
                this.$elemSubmit.removeAttr('disabled');
                this.$elemSubmit.removeAttr('data-wait');
            },

            _showStateInitial : function() {
                this._element.removeAttr('data-state');
            },

            _showStateSuccess : function() {
                console.log('showing');
                this._element.attr('data-state', 'success');
            },

            clear : function() {
                this._enableForm();
                this._showStateInitial();
                this.$elemTextarea.val('');
            },

            _getTemplateName : function() {
                return templateName;
            }

        });

        provide(PopupComment);

    });

}(this, this.modules, this.jQuery));