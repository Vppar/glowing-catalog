(function (angular) {
  'use strict';
  angular.module('glowingCatalogApp').controller(
    'MainCtrl', ['$scope', '$location', 'DataProvider', 'ArrayUtils', 'OrderService', 'DialogService', 'InventoryKeeper', 'UserService', function ($scope, $location, DataProvider, ArrayUtils, OrderService, DialogService, InventoryKeeper, UserService) {

      UserService.redirectIfInvalidUser();

      $scope.isCtrlsEnable = false;
      $scope.productSearch = {};

      $scope.toggleCtrls = function () {
        $scope.isCtrlsEnable = !$scope.isCtrlsEnable;
      }

      function dataProviderUpdate() {

        var sections = [];
        // var sections = ArrayUtils.distinct(DataProvider.products,
        // 'session');
        //
        sections.push('Mais Vendidos');
        sections.push('Cuidados com a Pele');
        sections.push('Maquiagem');
        sections.push('SPA e Fragrâncias');

        // Ed. Limitada
        // Lançamentos
        // Promoções

        $scope.sections = sections;
      }

      $scope.$on('DataProvider.update', dataProviderUpdate);
      dataProviderUpdate();

      var highlight = $location.search().highlight;
      $scope.selectedSection = highlight ? highlight : 'Mais Vendidos';
      $scope.selectedLine = '';

      $scope.$watch('selectedSection', function () {
        if ($scope.sections.indexOf($scope.selectedSection) === -1) {
          $scope.lines = [];
        } else {
          var products = ArrayUtils.filter(DataProvider.products, {
            session: $scope.selectedSection
          });
          var lines = ArrayUtils.distinct(products, 'line');

          $scope.lines = ArrayUtils.isIn(DataProvider.lines, 'name', lines);
          $scope.selectedLine = $scope.lines[0];
        }
      });

      $scope.$watch('productSearch.title', function (newVal, oldVal) {
        if (newVal && oldVal) {
          if (newVal.length < oldVal.length && newVal.length <= 2) {
            $scope.$broadcast('titleSearchClear');
          } else if (newVal.length > 2) {
            $scope.$broadcast('titleSearchUpdate', newVal);
          }
        }
      });

      $scope.selectSection = function (section) {
        $scope.selectedSection = section;
        $scope.isCtrlsEnable = false;
        $scope.productSearch.title = ''
      };
      $scope.selectLine = function (line) {
        $scope.selectedLine = line;
        $scope.productSearch.title = ''
      };

      $scope.$on('basketDialogOpen', function () {
        $scope.isCtrlsEnable = true;
      });
      $scope.$on('basketDialogClose', function () {
        $scope.isCtrlsEnable = false;
      });

      $scope.addBestSellerToBasket = function addBestSellerToBasket(number) {
        var product = ArrayUtils.find(DataProvider.products, 'bestSeller', number);

        var grid = ArrayUtils.list(InventoryKeeper.read(), 'parent', product.id);

        if (grid.length > 1) {
          DialogService.openDialogAddToBasketDetails({
            id: product.id,
            showDiscount: false
          });
        } else {
          DialogService.openDialogAddToBasket({
            id: product.id,
            showDiscount: false
          });
        }
      };
    }]);
}(angular));
