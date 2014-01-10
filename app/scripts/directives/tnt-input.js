(function(angular) {
	'use strict';

	angular.module('tnt.catalog.keyboard.input', []).directive(
			'tntInput',
			function(KeyboardService) {
				return {
					restrict : 'A',
					scope : {
						value : '=?ngModel',
						btnOk : '&'
					},
					link : function postLink(scope, element, attrs) {

						if (scope.value === undefined) {
							scope.value = '';
						}
						console.log(attrs);
						
						var input = {
							id : element.contents().context.id
						};

						var defaultValue = '0';

						input.keypress = function(key) {

							// if scope.value = defaultValue, this keys do
							// nothing
							// 0 is a number!! and 00 is a string!!
							if ((key === '0' || key === '00')
									&& scope.value === defaultValue) {

							} else if (key === 'backspace') {
								if (scope.value === defaultValue) {
									scope.value = '0';
									KeyboardService.prev();
								} else {
									scope.value = scope.value.substring(0,
											(scope.value.length - 1));
								}
							} else if (key === 'clear') {
								scope.value = defaultValue;
							} else if (key === 'ok') {
								KeyboardService.next();
							} else if (scope.value === defaultValue) {
								// if a regular key is pressed when the
								// scope.value = defaultValue, replace the value
								scope.value = key;
							} else if (scope.value.length < 10) {
								// not add a char when the value is at limit
								scope.value += key;
							}

							element.text(scope.value);
						};

						KeyboardService.register(input);

						element.bind('click', function() {
							scope.$apply(input.setFocus());
						});

						scope.$on('$destroy', function() {
							KeyboardService.unregister(input);
						});
					}
				};
			});
})(angular);