(function (angular) {
  'use strict';

  angular.module('glowingCatalogApp').directive('spy', function () {
    return {
      restrict: 'A',
      require: '^scrollSpy',
      link: function (scope, elem, attrs, ctrl) {

        var spyObj = {};

        attrs.$observe('spy', function (val) {

          spyObj = {
            id: val,
            'in': function () {
              return scope.$apply(attrs.spyScrollIn);
            },
            out: function () {
              return angular.noop;
            }
          };

          ctrl.addSpy(spyObj);
        });

        scope.$on('$destroy', function () {
          ctrl.delSpy(spyObj);
        });

        elem.bind('click', function () {
          ctrl.scroll(attrs.spy);
          scope.$apply();
        });
      }
    };
  });
})(angular);