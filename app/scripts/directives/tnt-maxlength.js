(function (angular) {
  'use strict';
  function tntMaxlength() {
    return {
      require: 'ngModel',
      restrict: 'A',
      link: function (scope, element, attrs, ctrl) {

        ctrl.$parsers.unshift(function (value) {
          var result = value;
          if (value && value.length >= attrs.tntMaxlength) {
            result = value.substr(0, attrs.tntMaxlength);
          }
          ctrl.$viewValue = result;
          ctrl.$render();
          return result;
        });
      }
    };
  }

  angular.module('tnt.catalog.attrs.tntMaxlength', []).directive('tntMaxlength', [tntMaxlength]);
}(angular));