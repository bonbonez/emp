/**
 * @fileOverview Функция создания примесей
 */

/**
 * @param       {Object}    window      Ссылка на window
 * @param       {Object}    document    Ссылка на document
 * @param       {Object}    BM          Ссылка на Bookmate namespace
 */
(function ( window, document, BM ) {
    var
        /**
         * @alias       BM.tools
         */
            tools = BM.tools = BM.tools || {},

        /**
         * Примешивает реализацию к объекту
         *
         * @alias    BM.tools.mixin
         *
         * @param    {Object}    obj              Объект, к которому примешивается имплементация
         * @param    {Object}    implementation   Примешиваемая имплементация
         */
            mixin = function mixin( obj, implementation ) {
            var
                prop,
                iprop,
                descr,
                getter,
                setter,
                oldImplementation;
            // end of vars

            for ( prop in implementation ) {
                if ( !implementation.hasOwnProperty( prop ) ) {
                    continue;
                }

                if ( Object.defineProperty ) {
                    descr = Object.getOwnPropertyDescriptor(implementation,prop);
                    if ( descr ) {
                        getter = descr.get;
                        setter = descr.set;
                    } else {
                        getter = undefined;
                        setter = undefined;
                    }
                    if ( getter || setter ) {
                        Object.defineProperty(obj,prop,{
                            get : getter,
                            set : setter
                        });
                        continue;
                    }
                }

                iprop = implementation[prop];

                // ссылки на функции просто копируются
                if ( tools.isFunction(iprop) ) {

                    obj[prop] = iprop;

                    // элементы также просто копируем
                } else if ( tools.isElement(iprop) ) {

                    obj[prop] = iprop;

                    // с объектами работает более тонко
                } else if ( tools.isObject(iprop) ) {

                    // регулярные выражения копируем, как ссылку
                    if ( tools.isRegExp(iprop) ) {

                        obj[prop] = iprop;

                    } else if ( tools.isConstructor() ) {
                        obj[prop] = iprop;

                        // ссылки на массивы просто сохраняет
                    } else if ( tools.isArray(iprop) ) {
                        obj[prop] = iprop;

                        // объект-экземпляры классов тоже
                    } else if ( tools.isInstance(iprop) ) {
                        obj[prop] = iprop;

                        // ссылки на jQuery instances просто копируются
                    } else if ( iprop instanceof tools.$ ) {

                        obj[prop] = iprop;

                        // обычные объекты js аккуратно копируем
                    } else {

                        // если объект не был создан, то создаем его
                        if ( tools.isUndefined(obj[prop]) ) {

                            obj[prop] = {};

                            // если на этом месте не объект, а еще что-то
                            // то создаем объект
                        } else if ( !tools.isObject(obj[prop]) ) {

                            obj[prop] = {};

                            // если объект на самом деле не принадлежит нам,
                            // то создаем новый объект, а старый копируем в него
                        } else if ( !obj.hasOwnProperty( prop ) ) {

                            oldImplementation = obj[prop];
                            obj[prop] = {};
                            tools.mixin(obj[prop],oldImplementation);
                        }

                        // примешиваем объект
                        tools.mixin(obj[prop],iprop);
                    }

                    // значения просто копируются
                } else {
                    obj[prop] = iprop;
                }
            }

            return obj;
        };
    // end of vars

    tools.mixin = mixin;
}(
        this,
        this.document,
        this.BM = this.BM || {}
    ));
