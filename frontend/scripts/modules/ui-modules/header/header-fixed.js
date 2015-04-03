(function(window, modules, $){

    modules.define('initFixedHeader', [], function(provide) {

        var $window                   = $(window),
            $elemCategoriesNavigation = $('.b-layout-top-categories-navigation'),
            $elemHeaderFixed          = $('@header-fixed'),
            offset                    = $elemCategoriesNavigation.offset(),
            height                    = $elemCategoriesNavigation.height(),
            scrollBreakpoint          = offset.top + height;

        var updateHeaderFixedVisibility = function() {
            if ($window.scrollTop() >= scrollBreakpoint) {
                $elemHeaderFixed.attr('data-visible', 'true');
            } else {
                $elemHeaderFixed.attr('data-visible', 'false');
            }
        };

        $window.on('scroll', function(event) {
            updateHeaderFixedVisibility();
        });

        updateHeaderFixedVisibility();

        provide();
    });

}(this, this.modules, this.jQuery));