(function(window) {
    'use strict';

    window.ObjectUtils = {
        /**
         * First inherits second
         */
        inherit : function(clazz, parent) {
            // We use an intermediary empty constructor to create an
            // inheritance chain, because using the super class' constructor
            // might have side effects.
            var Construct = function() {
            };
            Construct.prototype = parent.prototype;
            clazz.prototype = new Construct();
            clazz.prototype.constructor = clazz;
            clazz.parent = parent;
        },
        /**
         * First borrows methods from second
         */
        borrow : function(clazz, parent) {
            for ( var i = 2; i < arguments.length; i += 1) {
                var name = arguments[i];
                clazz.prototype[name] = parent.prototype[name];
            }
        },
        method : function(clazz, name, method) {
            clazz.prototype[name] = method;
        },
        /**
         * 1 - invoke method p1 from parent of instance p2
         * 
         * @param p1 - method name
         * @param p2 - instance
         * 
         * 2 - invoke constructor from parent of instance p1
         * @param p1 - instance
         */
        superInvoke : function(p1, p2) {
            var instance, name, args;

            if (typeof p1 === "string") {
                name = p1;
                instance = p2;

                args = Array.prototype.slice.call(arguments, 2);
                return instance.constructor.parent.prototype[name].apply(instance, args);
            } else {
                instance = p1;

                args = Array.prototype.slice.call(arguments, 1);
                return instance.constructor.parent.apply(instance, args);
            }
        },
        ro : function(obj, property, value) {
            Object.defineProperty(obj, property, {value : value,
                writable : false,
                enumerable : true,
                configurable : false});
        }
    };
}(window));
