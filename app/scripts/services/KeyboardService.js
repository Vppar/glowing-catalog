(function(angular) {
    'use strict';

    angular.module('tnt.catalog.keyboard.service', [
        'tnt.utils.array'
    ]).service('KeyboardService', function KeyboardService(ArrayUtils) {

        var fields = [];
        var currentField = null;
        var keyboard = {};

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
                keyboard.setActive(true);
            };

            fields.push(input);
            
            reorder();
        };

        this.unregister = function(input) {
            var foundItem = ArrayUtils.find(fields, 'id', input.id);
            if (foundItem) {
                var index = fields.indexOf(foundItem);
                fields.splice(index, 1);
            }
        };

        this.setKeyboard = function setKeyboard(value) {
            keyboard.setActive = value.setActive;
        };

        /**
         * Receives the key press from the virtual keyboard and propagates
         * accordingly
         */
        this.keypress = function(key) {
        	if(currentField){
        		currentField.keypress(key);
        	}else{
        		throw "currentField is not defined"; 
        	}
        };

        this.next = function() {
            var next = ArrayUtils.find(fields, 'id', currentField.next);

            if (next) {
                select(next);
            } else {
                unselect();
                keyboard.setActive(false);
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
            currentField.setActive(false);
            currentField = null;
        }
        
        function reorder(){
            var prev, current;
            
            for(var ix in fields){
                prev = current;
                current = fields[ix];
                
                if(prev){
                    if(!current.prev){
                        current.prev = prev.id;
                    }
                    
                    if(!prev.next){
                        prev.next = current.id;
                    }
                }
            }
        }
    });
})(angular);
