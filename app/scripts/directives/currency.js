(function (angular) {
  'use strict';
  function currency($filter) {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ctrl) {

        ctrl.$parsers.unshift(function (value) {
          var result = null;
          if (attrs.currency !== 'false') {
            value = String(value.replace(/[^0-9]/g, ''));
            var fmt = $filter('currency')(value / 100, '');
            ctrl.$viewValue = fmt;
            ctrl.$render();
            value = Number(value);
            result = value / 100;
          } else {
            result = value
          }
          return result;
        });
        ctrl.$formatters.unshift(function (value) {
          var result = null;
          if (attrs.currency !== 'false') {
            result = $filter('currency')(value, '');
          } else {
            result = value;
          }
          return result;
        });
      }
    };
  }

  angular.module('glowingCatalogApp').directive('currencyInput', ['$filter', currency]);
  angular.module('glowingCatalogApp').directive('currency', ['$filter', currency]);
}(angular));
