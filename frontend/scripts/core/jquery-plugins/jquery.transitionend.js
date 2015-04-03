(function(root, $){
    'use strict';

    var transitionEndEvents = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';

    $.fn.transitionEnd = function(callback) {
        return this.each(function(){
            var $this = $(this);
            $this.off(transitionEndEvents);
            $this.on(transitionEndEvents, function() {
                if (typeof callback == 'function') {
                    callback.call(this);
                }
            });
        });
    };

    $.fn.unbindTransitionEnd = function() {
        this.off(transitionEndEvents);
    };

}(this, jQuery));