(function(window, modules, BM, $){

    modules.define('baseView', ['basePubSub', 'extend'], function(provide, PubSub, extend){

        var BaseView = extend(PubSub),

            $class = BaseView,
            $super = $class.superclass;

        BM.tools.mixin($class.prototype, {

            initialize : function(config) {
                $super.initialize.apply(this, arguments);

                this._config = {};

                this.$elem = null;
                if (config && config.element) {
                    if (config.element instanceof $) {
                        if (config.element.length < 1) {
                            this._createElementFromTemplate();
                            return;
                        }
                    }
                    this.$elem = this._toJQueryObject(config.element);
                }
                if (!this.$elem || (config && config.useTemplateForced)) {
                    this._createElementFromTemplate();
                }

                this._defineFastProps();
            },

            _defineFastProps : function() {
              if (!this.el) {
                  Object.defineProperty(this, 'el', {
                    get : function() {
                        return !BM.tools.isNull(this.$elem) && this.$elem.length > 0 ? this.$elem : null;
                    }
                  })
              }
            },

            _toJQueryObject : function(element) {
                var $res = null;
                if (element) {
                    if (element instanceof $) {
                        $res = element;
                    } else if (element instanceof HTMLElement) {
                        $res = $(element);
                    } else if (typeof element === 'string') {
                        $res = $(element);
                    }
                }

                if ($res && $res.length > 0) {
                    return $res;
                }
                return null;
            },

            _createElementFromTemplate : function() {
                var templateName =  this._getTemplateName();
                this.$elem = $($('#' + templateName).html());
            },

            render: function(){
                var templateName = this._getTemplateName();
                var template = $('#'+templateName).html().replace(/&lt;%=/g, '<%=').replace(/%&gt;/g, '%>');
                var templateCompiled = BM.tools.template(template);
                this.$elem = $(templateCompiled({data: this.config.data}));
            },

            _parseConfig : function() {
                if (BM.tools.isUndefined(this._config)) {
                    this._config = {};
                }
                var dataConfig = this._parseDataConfig();
                if (BM.tools.isObject(dataConfig)) {
                    BM.tools.mixin(this._config, dataConfig);
                }
            },

            _parseDataConfig : function() {
                var dataConfig = {};
                try {
                    dataConfig = JSON.parse(this.$elem.attr('data-config'));

                    if (dataConfig['library_card']) {
                        dataConfig['libraryCard'] = dataConfig['library_card'];
                        delete dataConfig['library_card'];
                    }

                    if (dataConfig['read_button']) {
                        dataConfig['readButton'] = dataConfig['read_button'];
                        delete dataConfig['read_button'];
                    }
                } catch (e) { }

                return dataConfig;
            },

            /* Has to be overrided by children classes */
            _getTemplateName : function() {
                return '';
            },

            getElement : function() {
                return this.$elem;
            },

            _createElement : function() {
                this.$elem = $($('#' + this._getTemplateName()).html());
            },

            destroy : function() {
                this.$elem.off();
                this.$elem.remove();
                this.$elem = null;
                this._config = null;
                $super.destroy.apply(this, arguments);
            }

        });

        provide(BaseView);

    });

}(this, this.modules, this.BM, this.jQuery));