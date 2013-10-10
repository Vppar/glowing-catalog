(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').directive('phone', function phone($filter) {
        return {
            require : 'ngModel',
            link : function(scope, element, attrs, ctrl) {

                ctrl.$formatters.unshift(function format(value) {

                    var phone = value;
                    if (phone) {
                        phone = $filter('phone')(phone);
                    }
                    return phone;

                });

                ctrl.$parsers.unshift(function(value) {

                    var clearPhone = String(value.replace(/[^0-9]/g, ''));
                    var phone = $filter('phone')(clearPhone);

                    clearPhone = String(phone.replace(/[^0-9]/g, ''));

                    ctrl.$viewValue = phone;
                    ctrl.$render();

                    return clearPhone;
                });

            }
        };
    });
}(angular));
