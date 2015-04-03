(function(window, $, BM){

    BM = window.BM || {};
    BM.helper = BM.helper || {};
    BM.helper.event = BM.helper.event || {};

    var clickEventName = BM.tools.client.isTouch() ? 'tap' : 'click';

    BM.tools.mixin(BM.helper.event, {

        clickName : function() {
            return clickEventName;
        },

        isMouseLeftClick : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isNumber(event.which)) {
                return event.which === 1;
            }
        },

        isMouseMiddleClick : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isNumber(event.which)) {
                return event.which === 2;
            }
        },

        isMouseRightClick : function(event) {
            if (!BM.tools.isUndefined(event) && BM.tools.isNumber(event.which)) {
                return event.which === 3;
            }
        },

        isClickWithCtrl : function(event) {
            if (!BM.tools.isUndefined(event)) {
                if ( (!BM.tools.isUndefined(event.ctrlKey) && event.ctrlKey === true) || (!BM.tools.isUndefined(event.metaKey) && event.metaKey === true) ) {
                    return true;
                }
            }
            return false;
        },

        isSimpleMouseLeftClick : function(event) {
          return BM.helper.event.isMouseLeftClick(event) && !BM.helper.event.isClickWithCtrl(event);
        }

    });

}(this, this.jQuery, this.BM));