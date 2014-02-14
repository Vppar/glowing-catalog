(function(angular) {
    'use strict';

    angular.module('tnt.catalog.header', []).controller(
            'HeaderCtrl', function($scope, $filter, $location, $interval, OrderService, DialogService, UserService) {

                // #############################################################################################################
                // Scope variables from services
                // #############################################################################################################
                /**
                 * Expose basket in the scope.
                 */
                var order = OrderService.order;
                $scope.order = order;

                // FIXME: is it really safe to remove this? (see
                // $scope.checkout())
                function inBasketFilter(item) {
                    return Boolean(item.qty);
                }

                // #############################################################################################################
                // Dialogs control
                // #############################################################################################################
                /**
                 * Opens the dialog to change the password.
                 */
                $scope.openDialogChangePass = DialogService.openDialogChangePass;
                /**
                 * Opens the dialog to choose a customer.
                 */
                $scope.openDialogChooseCustomer = DialogService.openDialogChooseCustomer;
                /**
                 * Opens the dialog to input a product.
                 */
                $scope.openDialogInputProducts = DialogService.openDialogInputProducts;

                $scope.now = {};

                // #############################################################################################################
                // Flow control functions
                // #############################################################################################################
                /**
                 * Redirect to payment if products and customer were selected.
                 */
                $scope.checkout = function(bypassBasket) {
                    var basket = $filter('filter')(order.items, inBasketFilter);
                    if ((basket && basket.length > 0) || bypassBasket) {
                        if (order.customerId) {
                            $location.path('/payment');
                        } else {
                            DialogService.openDialogChooseCustomer().then(function(id) {
                                order.customerId = id;
                            });
                        }
                    } else {
                        DialogService.messageDialog({
                            title : 'Pagamento',
                            message : 'Nenhum produto selecionado.',
                            btnYes : 'OK'
                        });
                    }
                };

                function refreshDate() {
                    $scope.now.date = $filter('date')(new Date(), 'dd MMM yyyy');
                    $scope.now.time = $filter('date')(new Date(), 'HH:mm');
                }
                $interval(refreshDate, 10000);
                refreshDate();

                $scope.logout = function() {
                    return UserService.logout().then(function() {
                        $location.path('/login');
                    });
                };
            });
}(angular));
