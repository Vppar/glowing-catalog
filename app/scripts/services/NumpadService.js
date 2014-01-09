(function(angular) {
    'use strict';

    angular.module('tnt.catalog.numpad.service', []).service('NumpadService', function NumpadService() {

        var fields = [];
        var currentField = null;

        /**
         * register an input field
         */
        this.register = function(input) {

            // TODO do some checks here(must have a few callbacks and some data)

            input.openKeyboard = function() {
                select(currentField);
            };

            fields.push(input);
        };

        this.unregister = function(input) {
            // TODO remove input from the fields array
        };

        /**
         * Receives the key press from the virtual keyboard and propagates
         * accordingly
         */
        this.keypress = function(key) {
            input.keypress(key);
        };

        this.next = function() {
            var next = ArrayUtils.find(fields, 'id', currentField.next);

            if (next) {
                select(next);
            } else {
                unselect();
                // TODO close the keyboard
            }
        };

        this.prev = function() {
            // TODO implement previous just as next
        };

        function select(input) {
            if (currentField) {
                unselect();
            }

            currentField = input;
            currentField.selected = true;
        }

        function unselect() {
            currentField.selected = false;
            currentField = null;
        }
    });
})(angular);
