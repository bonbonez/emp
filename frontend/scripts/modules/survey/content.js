(function(window, modules, $){

    modules.define('moduleSurveyContent', ['basePubSub', 'extend', 'moduleItemGallery'], function(provide, PubSub, extend, ItemGallery) {

        var SurveyContent = extend(PubSub),

            $class = SurveyContent,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this.$elem               = config.element;
                this.$elemItemGaller     = null;
                this._itemGalleryHandler = null;

                this._setupEvents();
                this.update();
            },

            _setupEvents : function() {
                var me = this;
            },

            update : function() {
                this.$elemItemGallery = this.$elem.find('@bm-item-gallery');
                this._itemGalleryHandler = new ItemGallery({
                    element: this.$elemItemGallery
                })

            },

            updateItem : function(html) {
                if (this._itemGalleryHandler !== null) {
                    this._itemGalleryHandler.destroy();
                    this._itemGalleryHandler = null;
                }
                this.$elem.off();
                this.$elem.html('');
                this.$elem.append(html);
                this.update();
            },

        });

        provide(SurveyContent);

    });

}(this, this.modules, this.jQuery));