(function(window, modules, $){

    modules.define('moduleSurveyInit', [
        //'moduleSurveryItemGalleryInit',
        'moduleSurveyFormLogin',
        'moduleSurveyControls',
        'moduleSurveyContent',
        'moduleSurveyRequestHandler',
        'modulePopupComment'
    ], function(provide, FormLogin, SurveyControls, SurveyContent, RequestHandler, PopupComment){

        var formLogin = new FormLogin({
                element: $('@b-survey-login-form')
            }),
            surveyControls = new SurveyControls({
                element: $('@b-survey-controls')
            }),
            surveyContent = new SurveyContent({
                element: $('@b-survey-content')
            }),
            popupComment = new PopupComment();

        var callbackRequestNextSuccess = function(data) {
                /*var contentType = xhr.getResponseHeader("content-type") || '';
                if (contentType.indexOf('json') !== -1 && data['finished'] === true) {

                } else if (contentType.indexOf('html') !== -1) {
                    surveyContent.updateItem(data);
                }*/
                if (data) {
                    if (data['next_item_html'] !== null) {
                        surveyContent.updateItem(data['next_item_html']);
                    }
                    if (data['finished'] === true) {
                        window.location.reload();
                    }
                    if (data['left']) {
                        console.log('ok');

                        $('@b-survey-counter-items-left').html(data['left']);
                    }
                }
            },
            callbackRequestNextError = function() {

            };

        formLogin.on('login-success', function() {
            window.location.reload();
        });

        surveyControls.on('click-comment', function(){
            //RequestHandler.like(callbackRequestNextSuccess, callbackRequestNextError);
            popupComment.clear();
            popupComment.show();
        });
        surveyControls.on('click-like', function(){
            RequestHandler.like(callbackRequestNextSuccess, callbackRequestNextError);
        });
        surveyControls.on('click-best', function() {
            RequestHandler.best(callbackRequestNextSuccess, callbackRequestNextError);
        });
        surveyControls.on('click-next', function() {
            RequestHandler.next(callbackRequestNextSuccess, callbackRequestNextError);
        });

    });

}(this, this.modules, this.jQuery));