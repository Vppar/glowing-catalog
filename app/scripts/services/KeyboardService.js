(function(angular) {
    'use strict';

    angular.module('tnt.catalog.keyboard.service', [
        'tnt.utils.array'
    ]).service('KeyboardService', ['ArrayUtils', function KeyboardService(ArrayUtils) {

        var fields = [];
        var currentField = null;
        var keyboard = {};

        var active = false;
        var activeCallback = null;

        var that = this;

        this.setActive = function (isActive) {
            active = isActive;
            keyboard.active = isActive;
            if (angular.isFunction(activeCallback)) {
                activeCallback(active);
            }
            if (angular.isFunction(keyboard.setActive)) {
                keyboard.setActive(active);
            }
        };

        /**
         * register an input field
         */
        this.register = function(input) {

            if (!angular.isDefined(input.id)) {
                throw 'Input has no id attribute';
            }

            // TODO do some checks here(must have a few
            // callbacks and some data)
            input.setFocus = function() {
                select(input);
                that.setActive(true);
            };

            fields.push(input);

            reorder();
        };

        this.unregister = function(input) {
            var foundItem = ArrayUtils.find(fields, 'id', input.id);
            if (foundItem) {
                var index = fields.indexOf(foundItem);
                fields.splice(index, 1);
                
                if(currentField == foundItem){
                    this.setActive(false);
                    currentField = null;
                }
            } else {
                throw "input not found in fields";
            }
        };

        this.setKeyboard = function setKeyboard(value) {
            keyboard.status = value.status;
            activeCallback = value.setActive;
            value.setActive(active);
        };

        this.unsetKeyboard = function unsetKeyboard() {
            active = false;
            activeCallback = null;
        };
        
        this.getKeyboard = function() {
            return keyboard;
        };

        /**
         * Receives the key press from the virtual keyboard and propagates
         * accordingly
         */
        this.keypress = function(key) {
            if (currentField) {
                currentField.keypress(key);
            } else {
                throw "currentField is not defined";
            }
        };

        this.next = function() {
            var next = ArrayUtils.find(fields, 'id', currentField.next);

            if (next) {
                select(next);
            } else {
                unselect();
                this.setActive(false);
            }
        };

        this.prev = function() {
            var previous = ArrayUtils.find(fields, 'id', currentField.prev);

            if (previous) {
                select(previous);
            }
        };

        function select(input) {
            if (currentField) {
                unselect();
            }

            currentField = input;
            currentField.setActive(true);
        }

        function unselect() {
            if (currentField !== null) {
                currentField.setActive(false);
                currentField = null;
            }
        }
        
        this.quit = function(){
            unselect();
            this.setActive(false);
        };

        function reorder() {
            var prev, current;

            for ( var ix in fields) {
                prev = current;
                current = fields[ix];

                if (prev) {
                    if (!current.prev) {
                        current.prev = prev.id;
                    }

                    if (!prev.next) {
                        prev.next = current.id;
                    }
                }
            }
        }
    }]);
})(angular);
