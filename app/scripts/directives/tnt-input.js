(function(angular) {
	'use strict';

	angular
			.module('tnt.catalog.keyboard.input',
					[ 'tnt.catalog.keyboard.service' ])
			.directive(
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
								var minDigits = attrs.minDigits;
								var maxDigits = attrs.maxDigits;

								if (!attrs.minDigits)
									minDigits = 0;

								var input = {
									id : element.contents().context.id
								};

								var defaultValue = '0';

								input.keypress = function(key) {
									
									if ((key === '0' || key === '00')
											&& scope.value === defaultValue) {
										// if scope.value = defaultValue, this
										// keys do nothing

									} else if (key === 'backspace') {
										if (scope.value === defaultValue) {
											scope.value = '0';
											KeyboardService.prev();
										} else {
											scope.value = scope.value
													.substring(
															0,
															(scope.value.length - 1));
										}
									} else if (key === 'clear') {
										scope.value = defaultValue;
									} else if (key === 'ok') {
										KeyboardService.next();
									} else if (scope.value === defaultValue) {
										// if a regular key is pressed when the
										// scope.value = defaultValue, replace
										// the value
										scope.value = key;
									} else {
										if (maxDigits) {
											if (minDigits) {
												// if min and max are defined
												if (scope.value.length < maxDigits
														&& scope.value.length > minDigits) {
													scope.value += key;
												}
											} else {
												// if max is defined and min is
												// not
												if (scope.value.length < maxDigits) {
													scope.value += key;
												}
											}
										} else {
											// if min is defined and max is not
											if (minDigits) {
												if (scope.value.length > minDigits) {
													scope.value += key;
												}
											} else {
												// if both is no defined
												scope.value += key;
											}
										}
									}

									element.text(scope.value);
								};

								// TODO use proper formatter

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