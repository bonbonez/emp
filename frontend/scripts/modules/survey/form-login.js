(function(window, modules, $){

    modules.define('moduleSurveyFormLogin', ['basePubSub', 'extend'], function(provide, PubSub, extend) {

        var FormLogin = extend(PubSub),

            $class = FormLogin,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem          = config.element;
                this.$elemInputCode = this.$elem.find('@b-survey-login-form-input');
                this.$elemSubmit    = this.$elem.find('@b-survey-login-form-submit');

                this._setupEvents();
            },

            _setupEvents : function() {
                var me = this;
                this.$elemInputCode.on('keyup', function(event) {
                    me._onInputCodeKeyUp(event); 
                });
                this.$elemSubmit.on('click', function() {
                    me._onFormSubmit();
                });
            },

            _onInputCodeKeyUp : function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    this._onFormSubmit();
                    return;
                }
            },

            _onFormSubmit : function() {
                if (this._isFormValid()) {
                    this._sendRequestLogin();
                }
            },

            _sendRequestLogin : function() {
                var me = this;
                this._disableForm();
                $.ajax({
                    url: '/api/survey/login',
                    type: 'post',
                    dataType: 'json',
                    data: {
                        code: this._getInputCodeValue()
                    },
                    success : function(data) {
                        setTimeout(function(){
                            me._onLoginRequestSuccess(data);
                        }, 500);
                    },
                    error : function() {
                        setTimeout(function(){
                            me._onLoginRequestError();
                        }, 500);
                    }
                });
            },

            _onLoginRequestSuccess : function(data) {
                //this._enableForm();
                this._notify('login-success');
            },

            _onLoginRequestError : function() {
                this._enableForm();
                this._notify('login-error');
            },

            _enableForm : function() {
                this.$elemSubmit.removeAttr('disabled');
                this.$elemSubmit.removeAttr('data-wait');
                this.$elemInputCode.removeAttr('disabled');
            },

            _disableForm : function() {
                this.$elemSubmit.attr('disabled', 'disabled');
                this.$elemSubmit.attr('data-wait', 'true');
                this.$elemInputCode.attr('disabled', 'disabled');
            },

            _isFormValid : function() {
                var value = this._getInputCodeValue();
                return value && value.length > 0;
            },

            _getInputCodeValue : function() {
                return this.$elemInputCode.val();
            }

        });

        provide(FormLogin);

    });

}(this, this.modules, this.jQuery));