(function (angular) {
  'use strict';

  var templateUrl = 'components/mobile/catalog-section/catalog-section.html';

  angular.module('glowingCatalogApp').run(['$http', '$templateCache', function ($http, $templateCache) {

    $http.get(templateUrl, {
      cache: $templateCache
    });
  }]);

  angular.module('tnt.catalog.components.catalog-section', []).directive(
    'catalogSection', ['DataProvider', 'ArrayUtils', 'ProductLineUp', '$filter', function (DataProvider, ArrayUtils, ProductLineUp, $filter) {
      return {
        templateUrl: templateUrl,
        restrict: 'E',
        replace: true,
        scope: {
          line: '=',
          section: '='
        },
        controller: function ($scope) {
          $scope.$on('titleSearchUpdate', function (event, keyTitleSearch) {
              var result = $filter('filter')($scope.lineUp.all, function (product) {
                return product.title.toUpperCase().indexOf(keyTitleSearch.toUpperCase()) > -1
              });
              $scope.lineUp.left.length = 0;
              $scope.lineUp.right.length = 0;
              ProductLineUp.lineUp(result, $scope.lineUp.left, $scope.lineUp.right);
            }
          );
          $scope.$on('titleSearchClear', function (event) {
            $scope.lineUp.left.length = 0;
            $scope.lineUp.right.length = 0;
            ProductLineUp.lineUp($scope.lineUp.all, $scope.lineUp.left, $scope.lineUp.right);
          });
        },
        link: function postLink(scope, element, attrs) {

          scope.color = scope.line.color;

          scope.style = 'bg-' + scope.color;

          var filter = {
            line: scope.line.name,
            session: scope.section,
            active: true
          };

          var lineUp = ArrayUtils.filter(DataProvider.products, filter);

          // making a copy of lineup
          scope.lineUp = {};
          scope.lineUp.all = lineUp;
          scope.lineUp.left = [];
          scope.lineUp.right = [];

          ProductLineUp.lineUp(lineUp, scope.lineUp.left, scope.lineUp.right);

          if (scope.$parent.$last) {
            // FIXME the hierarchy is hard coded
            // FIXME does not react to browser resizes
            element.css('min-height', element.parent().parent().height() - 10);
          }
        }
      };
    }
    ])
  ;
}
(angular)
)
;
