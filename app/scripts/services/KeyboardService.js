(function(angular) {
	'use strict';

	angular.module('tnt.catalog.keyboard.service', [])
			.service(
					'KeyboardService',
					function KeyboardService() {

						var fields = [];
						var currentField = null;

						/**
						 * register an input field
						 */
						this.register = function(input) {

							if (!angular.isDefined(input.id)) {
								return;
							}
							

							// TODO do some checks here(must have a few
							// callbacks and some data)

							input.openKeyboard = function() {
								select(currentField);
							};

							fields.push(input);
						};

						this.unregister = function(input) {
							var foundItem = ArrayUtils.find(fields, 'id',
									input.id);
							if (foundItem) {
								var index = storage.indexOf(foundItem);
								fields.splice(index, 1);
							}

						};

						/**
						 * Receives the key press from the virtual keyboard and
						 * propagates accordingly
						 */
						this.keypress = function(key) {
							input.keypress(key);
						};

						this.next = function() {
							var next = ArrayUtils.find(fields, 'id',
									currentField.next);

							if (next) {
								select(next);
							} else {
								unselect();
								
								// TODO close the keyboard
							}
						};

						this.prev = function() {
							// TODO implement previous just as next
							var previous = ArrayUtils.find(fields, 'id',
									currentField.prev);

							if (previous) {
								select(previous);
							} else {
								unselect();
								// TODO close the keyboard
							}
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
