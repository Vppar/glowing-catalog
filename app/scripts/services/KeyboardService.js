(function(angular) {
    'use strict';

    angular.module('tnt.catalog.keyboard.service', ['tnt.utils.array']).service('KeyboardService', function KeyboardService(ArrayUtils) {

        var fields = [];
        var currentField = undefined;
        var keyboard = {};

        /**
         * register an input field
         */
        this.register = function(input) {
            if (!angular.isDefined(input.id)) {
                return;
            }

            // TODO do some checks here(must have a few
            // callbacks and some data)
            input.openKeyboard = function () {
                openKeyboard(input);
            };
            
            fields.push(input);
        };

        this.unregister = function(input) {
            var foundItem = ArrayUtils.find(fields, 'id', input.id);
            if (foundItem) {
                var index = fields.indexOf(foundItem);
                fields.splice(index, 1);
            }

        };

        this.setKeyboard = function setKeyboard(value) {
            keyboard = value;
        };

        /**
         * Receives the key press from the virtual keyboard and propagates
         * accordingly
         */
        this.keypress = function(key) {
            currentField.keypress(key);
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
            var previous = ArrayUtils.find(fields, 'id', currentField.prev);

            if (previous) {
                select(previous);
            } else {
                unselect();
                // TODO close the keyboard
            }
        };
        
        this.readFields = function(){
            return angular.copy(fields);
        };
        
        this.readCurrentField = function(){
            return angular.copy(currentField);
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
        
        this.readFields = function(){
            return angular.copy(fields);
        };
        
        this.readCurrentField = function(){
            return angular.copy(currentField);
        };
        
        function openKeyboard(input) {
            select(input);
            console.log(keyboard);
            keyboard.isActive = true;
        };

        function closeKeyboard() {
            keyboard.isActive = false;
        };
    });
})(angular);
