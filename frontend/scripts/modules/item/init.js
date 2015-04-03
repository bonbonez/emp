(function(window, modules, $){

    modules.define('moduleItemInit', ['moduleItemGallery'], function(provide, ItemGallery){

        var $window = $(window),
            $elemLayoutItem = $('.b-layout-item'),

            itemGallery = new ItemGallery({
                element: $('@bm-item-gallery')
            }),

            gallerySize = itemGallery.size(),
            layoutItemOffset = $elemLayoutItem.offset(),
            layoutItemHeight = $elemLayoutItem.height(),
            breakpointFixed  = layoutItemOffset.top,
            breakpointDocked = layoutItemOffset.top + layoutItemHeight - gallerySize.height,

            updatePositionGallery = function() {
                var scrollTop = $window.scrollTop();

                if (scrollTop >= breakpointDocked) {
                    itemGallery.setPositionDockedToBottom(true);
                } else if (scrollTop >= breakpointFixed) {
                    itemGallery.setPositionFixed(true);
                } else {
                    itemGallery.setPositionFixed(false);
                    itemGallery.setPositionDockedToBottom(false);
                }
            };

        $window.on('scroll', updatePositionGallery);
        updatePositionGallery();

        provide();
    });

}(this, this.modules, this.jQuery));