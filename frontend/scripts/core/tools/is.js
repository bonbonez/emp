(function ( window, document, BM, undefined ) {
    var tools = BM.tools = BM.tools || {},

        isUndefined = function isUndefined( obj ) {
            if ( typeof obj === 'undefined' ) {
                return true;
            }

            return false;
        },

        isNull = function isNull( obj ) {
            if ( tools.isUndefined ( obj ) ) {
                return true;
            }

            if ( obj === null ) {
                return true;
            }

            return false;
        },

        isPresent = function(obj) {
          return !tools.isUndefined(obj) && !tools.isNull(obj);
        },

        isNumber = function isNumber( obj ) {
            if ( typeof obj === 'number' ) {
                return true;
            }

            return false;
        },

        isPowerOfTwo = function isPowerOfTwo( n ) {
            if ( tools.isNumber( n ) ) {
                return (n !== 0) && ((n & (n - 1)) === 0);
            }
            else {
                return false;
            }
        },

        isObject = function isObject( obj ) {
            if ( obj === null ) {
                return false;
            }

            if ( typeof obj !== 'object' ) {
                return false;
            }

            return true;
        },

        isRegExp = function isRegExp( obj ) {
            return Object.prototype.toString.call(obj) === '[object RegExp]';
        },

        isArray = function isArray(obj) {
            return Object.prototype.toString.call(obj) === '[object Array]';
        },

        isString = function isString( obj ) {
            if ( typeof obj === 'string' ) {
                return true;
            }

            return false;
        },

        isFunction = function isFunction( obj ) {
            return !!(obj && obj.constructor && obj.call && obj.apply);
        },

        isConstructor = function isConstructor( obj ) {
            return !!(tools.isFunction(obj) && obj.superclass);
        },

        isInstance = function isInstance( obj ) {
            if ( tools.isNull(obj) ) {
                return false;
            }

            if ( tools.isConstructor(obj) ) {
                return false;
            }

            if ( !tools.isObject(obj) ) {
                return false;
            }

            return true;
        },

        isInstanceOf = function isInstanceOf( obj, classObj ) {
            if ( obj instanceof classObj ) {
                return true;
            }

            return false;
        },

        isNaN = function isNaN( obj ) {
            return obj !== obj;
        },

        isElement = function isElement( obj ) {
            return !!(obj && obj.nodeType === 1);
        },

        isDate = function isDate( obj ) {
            return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
        },

        isBoolean = function isBoolean( obj ) {
            return (typeof obj === 'boolean');
        },

        isEqual = function isEqual( a, b ) {
            var
                atype,
                btype,
                aKeys,
                bKeys,
                key;
            // end of vars
            
            // Check object identity.
            if ( a === b ) {
                return true;
            }
            // Different types?
            atype = typeof(a);
            btype = typeof(b);

            if ( atype !== btype ) {
                return false;
            }
            // Basic equality test (watch out for coercions).
            if ( a === b ) {
                return true;
            }
            // One is falsy and the other truthy.
            if ( (!a && b) || (a && !b) ) {
                return false;
            }
            // Check dates' integer values.
            if ( tools.isDate(a) && tools.isDate(b) ) {
                return a.getTime() === b.getTime();
            }
            // Both are NaN?
            if ( tools.isNaN(a) && tools.isNaN(b) ) {
                return false;
            }
            // If a is not an object by this point, we can't handle it.
            if ( atype !== 'object' ) {
                return false;
            }
            // Check for different array lengths before comparing contents.
            if ( a.length && (a.length !== b.length) ) {
                return false;
            }
            // if is a DOM elements and is not '==' then false
            if ( tools.isElement(a) || tools.isElement(b) ) {
                return false;
            }
            // Nothing else worked, deep compare the contents.
            
            aKeys = tools.keys(a);
            bKeys = tools.keys(b);

            // Different object sizes?
            if ( aKeys.length !== bKeys.length ) {
                return false;
            }
            // Recursive comparison of contents.
            for ( key in a ) {
                if ( !(key in b ) || !tools.isEqual(a[key], b[key])) {
                    return false;
                }
            }

            return true;
        },

        isEmpty = function(obj) {
            if (!isObject(obj)) {
                return;
            }
            if (isArray(obj)) {
                return obj.length > 0;
            }
            var prop, hasOwnProp = Object.prototype.hasOwnProperty;
            for (prop in obj) {
                if (hasOwnProp.call(obj, prop)) {
                    return false;
                }
            }
            return true;
        };
    // end of vars

    tools.isUndefined   = isUndefined;
    tools.isNull        = isNull;
    tools.isPresent     = isPresent;
    tools.isNumber      = isNumber;
    tools.isPowerOfTwo  = isPowerOfTwo;
    tools.isObject      = isObject;
    tools.isRegExp      = isRegExp;
    tools.isArray       = Array.isArray || isArray;
    tools.isString      = isString;
    tools.isFunction    = isFunction;
    tools.isConstructor = isConstructor;
    tools.isInstance    = isInstance;
    tools.isInstanceOf  = isInstanceOf;
    tools.isNaN         = isNaN;
    tools.isElement     = isElement;
    tools.isDate        = isDate;
    tools.isBoolean     = isBoolean;
    tools.isEqual       = isEqual;
    tools.isEmpty       = isEmpty;

}(
    this,
    this.document,
    this.BM = this.BM || {}
));