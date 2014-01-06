(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller('MainCtrl', function($scope, DataProvider, ArrayUtils) {

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

        $scope.$watch('selectedSection', function(val) {
            var products = ArrayUtils.filter(DataProvider.products, {
                session : val
            });
            var lines = ArrayUtils.distinct(products, 'line');
            
            $scope.lines = ArrayUtils.isIn(DataProvider.lines, 'name', lines);
        });

        $scope.selectSection = function(section) {
            $scope.selectedSection = section;
        };

        $scope.selectedSection = 'Mais Vendidos';
    });
}(angular));