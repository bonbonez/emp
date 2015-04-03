module('Vendor loaded')
    test('typeof test', function() {
        equal( typeof jQuery , 'function', 'jQuery is function' );
        equal( typeof $ , 'function', '$ is function' );
        equal( typeof $LAB , 'object', '$LAB is object' );
        equal( typeof radio , 'function', 'radio is function' );
        equal( typeof JSON , 'object', 'JSON is object' );
        equal( typeof docCookies , 'object', 'docCookies is object' );
    });
    
module('Namespace')
    test('Namespace BM created', function() {
        equal( typeof BM , 'object', 'BM created' );
    });
    test('Space BM.config created', function() {
        equal( typeof BM.config , 'object', 'BM.config created' );
    });
    test('Space BM.tools created', function() {
        equal( typeof BM.tools , 'object', 'BM.tools created' );
    });
    test('Space BM.features created', function() {
        equal( typeof BM.features , 'object', 'BM.features created' );
    });

module('PubSub with radio.js')
    test('Publish and subscribe', function() {
        var
            testvar = false,
            callback = function ( data ) {
                testvar = data;
            };
        // end of vars
        
        radio('testevent');
        radio('testevent').subscribe(callback);
        radio('testevent').broadcast(true);

        equal( testvar , true, 'Publish and subscribe complete' );
    });

    test('Unsubscribe', function() {
        var
            testvar = false,
            callback = function ( data ) {
                testvar = data;
            };
        // end of vars
        
        radio('testevent');
        radio('testevent').subscribe(callback);
        radio('testevent').unsubscribe(callback);
        radio('testevent').broadcast(true);

        equal( testvar , false, 'Unsubscribe complete' );
    });

module('JSON.js')
    test('JSON', function(){
        var
            foo = {},
            JSONfoo, backToJS;
        // end of vars
        
        foo.bar = 'new property';
        foo.baz = 3;
        JSONfoo = JSON.stringify(foo);
        equal( JSONfoo, '{"bar":"new property","baz":3}', 'JSON.stringify method works' );

        backToJS = JSON.parse(JSONfoo);
        deepEqual( foo, backToJS, 'JSON.parse method works' );
    });

module('cookies.js');
    test('get-set', function() {
        docCookies.setItem( 'test1', 'Hello world!');
        docCookies.setItem( 'test2', 'Hello world!', new Date(2020, 5, 12));
        docCookies.setItem( 'test3', 'Hello world!', new Date(2027, 2, 3), '/hidden');
        docCookies.setItem( 'test4', 'Hello world!', 'Sun, 06 Nov 2022 21:43:15 GMT');
        docCookies.setItem( 'test5', 'Hello world!', 'Tue, 06 Dec 2022 13:11:07 GMT', '/hidden');
        docCookies.setItem( 'test6', 'Hello world!', 150);
        docCookies.setItem( 'test7', 'Hello world!', 245, '/hidden');
        docCookies.setItem( 'test8', 'Hello world!', null, null, 'hidden.com');
        docCookies.setItem( 'test9', 'Hello world!', null, null, null, true);
        
        equal( docCookies.getItem('test1'), 'Hello world!', 'value only');
        equal( docCookies.getItem('test2'), 'Hello world!', 'expires date');
        equal( docCookies.getItem('test3'), null, 'expires date plus directory');
        equal( docCookies.getItem('test4'), 'Hello world!', 'expires date in GMT');
        equal( docCookies.getItem('test5'), null, 'expires date in GMT plus directory');
        equal( docCookies.getItem('test6'), 'Hello world!', 'expires date in secs') ;
        equal( docCookies.getItem('test7'), null, 'expires date in GMT plus directory');
        equal( docCookies.getItem('test8'), null, 'hidden domain');
        equal( docCookies.getItem('test9'), null, 'https protocol only');
    });
module('is.js');
    test('isUndefined', function() {
        var
            tools = BM.tools,
            someVars;
        // end of vars

        equal( tools.isUndefined(someVars), true, 'check undefined var' );
        equal( tools.isUndefined(BM), false, 'check defined var' );
    });
    test('isNull', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            emptyArray = [],
            someVars;
        // end of vars

        equal( tools.isNull(someVars), true, 'check null' );
        equal( tools.isNull(obj), false, 'check empty object' );
        equal( tools.isNull(BM), false, 'check number' );
        equal( tools.isNull(BM), false, 'check empty array' );
    });
    test('isNumber', function() {
        var
            tools = BM.tools,
            object = {},
            array = [],
            someVars = 1;
        // end of vars

        equal( tools.isNumber(someVars), true, 'check number' );
        equal( tools.isNumber(object), false, 'check object' );
        equal( tools.isNumber(array), false, 'check array' );
    });
    test('isPowerOfTwo', function() {
        var
            tools = BM.tools,
            someVars = 3,
            someVars2 = 4;
        // end of vars

        equal( tools.isPowerOfTwo(someVars), false, 'check number 3' );
        equal( tools.isPowerOfTwo(someVars2), true, 'check number 4' );
        equal( tools.isPowerOfTwo(BM), false, 'check not number var' );
    });
    test('isObject', function() {
        var
            tools = BM.tools,
            someVars = 3;
        // end of vars

        equal( tools.isObject(someVars), false, 'check not object' );
        equal( tools.isObject(BM), true, 'check object' );
    });
    test('isRegExp', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            emptyRe = new RegExp(),
            re = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))$/i;
        // end of vars

        equal( tools.isRegExp(obj), false, 'check object' );
        equal( tools.isRegExp(number), false, 'check number' );
        equal( tools.isRegExp(re), true, 'check regExp' );
        equal( tools.isRegExp(emptyRe), true, 'check empty regExp' );
    });
    test('isArray', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            emptyArray = [],
            str = '',
            fullArray = [1, 1, '2'];
        // end of vars

        equal( tools.isArray(obj), false, 'check object' );
        equal( tools.isArray(number), false, 'check number' );
        equal( tools.isArray(str), false, 'check string' );
        equal( tools.isArray(emptyArray), true, 'check empty array' );
        equal( tools.isArray(fullArray), true, 'check full array' );
    });
    test('isString', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            emptyStr = '',
            fullStr = '1213';
        // end of vars

        equal( tools.isString(obj), false, 'check object' );
        equal( tools.isString(number), false, 'check number' );
        equal( tools.isString(array), false, 'check array' );
        equal( tools.isString(emptyStr), true, 'check empty string' );
        equal( tools.isString(fullStr), true, 'check full string' );
    });
    test('isFunction', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            str = '',
            fun = function(){};
        // end of vars

        equal( tools.isFunction(obj), false, 'check object' );
        equal( tools.isFunction(number), false, 'check number' );
        equal( tools.isFunction(array), false, 'check array' );
        equal( tools.isFunction(str), false, 'check string' );
        equal( tools.isFunction(fun), true, 'check function' );
    });
    test('isConstructor', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            str = '',
            fun = function() {},

            ConstructorName = (function() {
                'use strict';
            
                function ConstructorName( args ) {
                    // enforces new
                    if ( !(this instanceof ConstructorName) ) {
                        return new ConstructorName(args);
                    }
                    // constructor body
                }

                ConstructorName.superclass = true;

                return ConstructorName;
            }());
        // end of vars

        equal( tools.isConstructor(obj), false, 'check object' );
        equal( tools.isConstructor(number), false, 'check number' );
        equal( tools.isConstructor(array), false, 'check array' );
        equal( tools.isConstructor(str), false, 'check string' );
        equal( tools.isConstructor(fun), false, 'check function' );
        equal( tools.isConstructor(ConstructorName), true, 'check constructor' );
    });
    test('isInstanceOf', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            str = '',
            fun = function() {},

            ConstructorName = (function() {
                'use strict';
            
                function ConstructorName( args ) {
                    // enforces new
                    if ( !(this instanceof ConstructorName) ) {
                        return new ConstructorName(args);
                    }
                    // constructor body
                }

                ConstructorName.superclass = true;

                return ConstructorName;
            }()),

            createdObj = new ConstructorName();
        // end of vars

        equal( tools.isInstanceOf(obj, Object), true, 'check object' );
        equal( tools.isInstanceOf(number, Number), false, 'check number' );
        equal( tools.isInstanceOf(array, Object), true, 'check array' );
        equal( tools.isInstanceOf(str, String), false, 'check string as String' );
        equal( tools.isInstanceOf(str, Object), false, 'check string as Object' );
        equal( tools.isInstanceOf(fun, ConstructorName), false, 'check function' );
        equal( tools.isInstanceOf(createdObj, ConstructorName), true, 'check constructor' );
    });
    test('isNaN', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            nan = NaN;
        // end of vars

        equal( tools.isNaN(obj), false, 'check object' );
        equal( tools.isNaN(number), false, 'check number' );
        equal( tools.isNaN(array), false, 'check array' );
        equal( tools.isNaN(nan), true, 'check NaN' );
    });
    test('isElement', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            elemArray = document.getElementsByTagName('script'),
            elemScript = document.getElementsByTagName('script')[0],
            elemBody = document.getElementsByTagName('body')[0];
        // end of vars

        equal( tools.isElement(obj), false, 'check object' );
        equal( tools.isElement(number), false, 'check number' );
        equal( tools.isElement(array), false, 'check array' );
        equal( tools.isElement(elemScript), true, 'check element Script' );
        equal( tools.isElement(elemBody), true, 'check element Body' );
        equal( tools.isElement(elemArray), false, 'check elements' );
    });
    test('isDate', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            bool = true,
            str = 'false',
            date = new Date();
        // end of vars

        equal( tools.isDate(obj), false, 'check object' );
        equal( tools.isDate(number), false, 'check number' );
        equal( tools.isDate(array), false, 'check array' );
        equal( tools.isDate(str), false, 'check string' );
        equal( tools.isDate(bool), false, 'check bool' );
        equal( tools.isDate(date), true, 'check date' );
    });
    test('isBoolean', function() {
        var
            tools = BM.tools,
            obj = {},
            number = 3,
            array = [],
            bool = true,
            boolStr = 'false';
        // end of vars

        equal( tools.isBoolean(obj), false, 'check object' );
        equal( tools.isBoolean(number), false, 'check number' );
        equal( tools.isBoolean(array), false, 'check array' );
        equal( tools.isBoolean(boolStr), false, 'check bool string' );
        equal( tools.isBoolean(bool), true, 'check bool' );
    });
    test('isEqual', function() {
        var
            tools = BM.tools,
            
            obj = {},
            obj2 = {},
            obj3 = {
                '1': true
            },
            obj4 = {
                '2': true
            },
            obj5 = {
                '2': true
            },

            number = 3,
            number2 = 2,
            number3 = 3,

            string = '123123',
            string2 = '123123',
            string3 = '1231234',

            array = [],
            array2 = [],
            array3 = ['1', '2', '3'],
            array4 = ['1', '2', '3'];
        // end of vars

        equal( tools.isEqual(obj, obj2), true, 'check object equal object' );
        equal( tools.isEqual(obj2, obj3), false, 'check object equal object' );
        equal( tools.isEqual(obj3, obj4), false, 'check object equal object' );
        equal( tools.isEqual(obj4, obj5), true, 'check object equal object' );

        equal( tools.isEqual(number, number2), false, 'check number equal number' );
        equal( tools.isEqual(number, number3), true, 'check number equal number' );

        equal( tools.isEqual(string, string2), true, 'check string equal string' );
        equal( tools.isEqual(string2, string3), false, 'check string equal string' );

        equal( tools.isEqual(array, array2), true, 'check array equal array' );
        equal( tools.isEqual(array2, array3), false, 'check array equal array' );
        equal( tools.isEqual(array3, array4), true, 'check array equal array' );
    });