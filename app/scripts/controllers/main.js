(function(angular) {
    'use strict';
    angular.module('glowingCatalogApp').controller(
            'MainCtrl',
            function($scope, $dialog, $location, OrderService, DialogService) {

                // #############################################################################################################
                // Dialogs control
                // #############################################################################################################
                /**
                 * Opens the dialog to add a product to the basket and in the
                 * promise resolution add it to the basket ... or do nothing.
                 */
                $scope.add = function(product) {

                    if (OrderService.order.id === undefined) {
                        OrderService.createNew();
                    }

                    if (product.gridList.length > 1) {
                        DialogService.openDialogAddToBasketDetails({
                            id : product.id
                        });
                    } else {
                        DialogService.openDialogAddToBasket({
                            id : product.id
                        });
                    }

                };

                $scope.lines =
                        [
                            "Perfumes", "Maquiagem", "Zen in Bloom", "Hollywood Mystique", "Acessórios", "TimeWise", "TimeWise Repair",
                            "Botanical Effects", "Acne", "Clássica", "Velocity", "MKMen", "Cuidados Personalizados",
                            "Cuidados com o Corpo", "Solar", "MK at Play", "Sobrancelhas", "Esmalte"
                        ];
            });
}(angular));